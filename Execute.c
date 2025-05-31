#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <winsock2.h>
#include <windows.h>
#include <sys/stat.h>
#include <dirent.h>
#include <stdint.h>
#include <time.h>  
#include <signal.h>

#pragma comment(lib, "ws2_32.lib")

typedef struct MemoryPool {
    void** blocks;
    size_t* sizes;
    int count;
    int capacity;
    size_t total_allocated;
} MemoryPool;

static MemoryPool* memory_pool = NULL;
static FILETIME last_check_time;
static int files_changed = 0;

static inline void fast_memcpy(void* dest, const void* src, size_t n) {
    #ifdef _WIN64
    __asm__ volatile (
        "cld\n\t"
        "rep movsb"
        : "=&D" (dest), "=&S" (src), "=&c" (n)
        : "0" (dest), "1" (src), "2" (n)
        : "memory"
    );
    #else
    memcpy(dest, src, n);
    #endif
}

static inline void fast_memset(void* dest, int val, size_t n) {
    #ifdef _WIN64
    __asm__ volatile (
        "cld\n\t"
        "rep stosb"
        : "=&D" (dest), "=&c" (n)
        : "0" (dest), "a" (val), "1" (n)
        : "memory"
    );
    #else
    memset(dest, val, n);
    #endif
}

static inline size_t fast_strlen(const char* str) {
    size_t len;
    #ifdef _WIN64
    __asm__ volatile (
        "xor %%rax, %%rax\n\t"
        "mov $-1, %%rcx\n\t"
        "cld\n\t"
        "repne scasb\n\t"
        "not %%rcx\n\t"
        "dec %%rcx"
        : "=c" (len)
        : "D" (str), "a" (0)
        : "memory"
    );
    return len;
    #else
    return strlen(str);
    #endif
}

MemoryPool* init_memory_pool(int initial_capacity) {
    MemoryPool* pool = (MemoryPool*)malloc(sizeof(MemoryPool));
    if (!pool) return NULL;
    
    pool->blocks = (void**)malloc(sizeof(void*) * initial_capacity);
    pool->sizes = (size_t*)malloc(sizeof(size_t) * initial_capacity);
    pool->count = 0;
    pool->capacity = initial_capacity;
    pool->total_allocated = 0;
    
    if (!pool->blocks || !pool->sizes) {
        free(pool->blocks);
        free(pool->sizes);
        free(pool);
        return NULL;
    }
    
    fast_memset(pool->blocks, 0, sizeof(void*) * initial_capacity);
    fast_memset(pool->sizes, 0, sizeof(size_t) * initial_capacity);
    
    printf("Memory pool initialized with %d slots\n", initial_capacity);
    return pool;
}

void* smart_malloc(size_t size) {
    if (!memory_pool) {
        memory_pool = init_memory_pool(100);
        if (!memory_pool) return NULL;
    }
    
    void* ptr = malloc(size);
    if (!ptr) return NULL;
    
    if (memory_pool->count >= memory_pool->capacity) {
        int new_capacity = memory_pool->capacity * 2;
        void** new_blocks = (void**)realloc(memory_pool->blocks, sizeof(void*) * new_capacity);
        size_t* new_sizes = (size_t*)realloc(memory_pool->sizes, sizeof(size_t) * new_capacity);
        
        if (new_blocks && new_sizes) {
            memory_pool->blocks = new_blocks;
            memory_pool->sizes = new_sizes;
            memory_pool->capacity = new_capacity;
            printf("Memory pool expanded to %d slots\n", new_capacity);
        }
    }
    
    if (memory_pool->count < memory_pool->capacity) {
        memory_pool->blocks[memory_pool->count] = ptr;
        memory_pool->sizes[memory_pool->count] = size;
        memory_pool->count++;
        memory_pool->total_allocated += size;
    }
    
    fast_memset(ptr, 0, size);
    return ptr;
}

void smart_free(void* ptr) {
    if (!ptr || !memory_pool) return;
    
    for (int i = 0; i < memory_pool->count; i++) {
        if (memory_pool->blocks[i] == ptr) {
            memory_pool->total_allocated -= memory_pool->sizes[i];
            
            for (int j = i; j < memory_pool->count - 1; j++) {
                memory_pool->blocks[j] = memory_pool->blocks[j + 1];
                memory_pool->sizes[j] = memory_pool->sizes[j + 1];
            }
            memory_pool->count--;
            break;
        }
    }
    
    free(ptr);
}

void* optimized_file_read(FILE* file, size_t size) {
    void* buffer = smart_malloc(size);
    if (!buffer) return NULL;
    
    const size_t chunk_size = 4096;
    size_t bytes_read = 0;
    char* ptr = (char*)buffer;
    
    while (bytes_read < size) {
        size_t to_read = (size - bytes_read < chunk_size) ? size - bytes_read : chunk_size;
        size_t read = fread(ptr + bytes_read, 1, to_read, file);
        if (read == 0) break;
        bytes_read += read;
    }
    
    return buffer;
}

static inline uint64_t get_cpu_cycles() {
    uint64_t cycles;
    #ifdef _WIN64
    __asm__ volatile (
        "rdtsc\n\t"
        "shl $32, %%rdx\n\t"
        "or %%rdx, %%rax"
        : "=a" (cycles)
        :
        : "rdx"
    );
    return cycles;
    #else
    return 0;
    #endif
}

int check_files_modified() {
    uint64_t start_cycles = get_cpu_cycles();
    
    WIN32_FIND_DATA findFileData;
    HANDLE hFind;
    FILETIME current_time;
    int changed = 0;
    
    GetSystemTimeAsFileTime(&current_time);
    
    const char* patterns[] = {"*.html", "*.css", "*.js", "*.json"};
    int pattern_count = sizeof(patterns) / sizeof(patterns[0]);
    
    for (int i = 0; i < pattern_count; i++) {
        hFind = FindFirstFile(patterns[i], &findFileData);
        
        if (hFind != INVALID_HANDLE_VALUE) {
            do {
                if (CompareFileTime(&findFileData.ftLastWriteTime, &last_check_time) > 0) {
                    printf("File changed: %s\n", findFileData.cFileName);
                    changed = 1;
                }
            } while (FindNextFile(hFind, &findFileData) != 0);
            
            FindClose(hFind);
        }
    }
    
    if (changed) {
        GetSystemTimeAsFileTime(&last_check_time);
        files_changed = 1;
    }
    
    uint64_t end_cycles = get_cpu_cycles();
    if (end_cycles > start_cycles) {
        printf("🔍 File check took %llu CPU cycles\n", end_cycles - start_cycles);
    }
    
    return changed;
}

void serve_file(SOCKET client, const char *filename) {
    uint64_t start_cycles = get_cpu_cycles();
    
    FILE *file = fopen(filename, "rb");
    if (!file) {
        const char *not_found = 
            "HTTP/1.1 404 Not Found\r\n"
            "Content-Type: text/html\r\n"
            "Content-Length: 47\r\n\r\n"
            "<h1>404 Not Found</h1><p>File not found</p>";
        send(client, not_found, strlen(not_found), 0);
        return;
    }

    const char *ext = strrchr(filename, '.');
    const char *mime = "text/plain";
    if (ext) {
        if (strcmp(ext, ".html") == 0) mime = "text/html";
        else if (strcmp(ext, ".js") == 0) mime = "application/javascript";
        else if (strcmp(ext, ".css") == 0) mime = "text/css";
        else if (strcmp(ext, ".png") == 0) mime = "image/png";
        else if (strcmp(ext, ".jpg") == 0 || strcmp(ext, ".jpeg") == 0) mime = "image/jpeg";
        else if (strcmp(ext, ".svg") == 0) mime = "image/svg+xml";
        else if (strcmp(ext, ".json") == 0) mime = "application/json";
        else if (strcmp(ext, ".ico") == 0) mime = "image/x-icon";
    }

    fseek(file, 0, SEEK_END);
    long size = ftell(file);
    rewind(file);
    
    char *buffer = (char*)smart_malloc(size);
    size_t bytes_read = fread(buffer, 1, size, file);
    fclose(file);

    if (!buffer || bytes_read == 0) {
        const char *error = "HTTP/1.1 500 Internal Server Error\r\n\r\nMemory allocation failed";
        send(client, error, strlen(error), 0);
        if (buffer) smart_free(buffer);
        return;
    }

    char *header = (char*)smart_malloc(512);
    int header_len = snprintf(header, 512,
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: %s\r\n"
            "Content-Length: %zu\r\n"
            "Cache-Control: no-cache\r\n"
            "X-Memory-Pool: %zu bytes allocated\r\n\r\n",
            mime, bytes_read, memory_pool ? memory_pool->total_allocated : 0);

    send(client, header, header_len, 0);
    send(client, buffer, bytes_read, 0);
    
    smart_free(buffer);
    smart_free(header);
    
    uint64_t end_cycles = get_cpu_cycles();
    if (end_cycles > start_cycles) {
        printf("⚡ File serve took %llu CPU cycles\n", end_cycles - start_cycles);
    }
}

void serve_reload(SOCKET client) {
    int should_reload = files_changed;
    if (should_reload) files_changed = 0;

    char response[256];
    int response_len = snprintf(
        response, sizeof(response),
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: application/json\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Cache-Control: no-cache\r\n\r\n"
        "{\"reload\":%s,\"timestamp\":%ld,\"memory_usage\":%zu}",
        should_reload ? "true" : "false",
        (long)time(NULL),
        memory_pool ? memory_pool->total_allocated : 0
    );
    send(client, response, response_len, 0);
}

void serve_live_script(SOCKET client) {
    serve_file(client, "live-reload.js");
}

void cleanup_memory_pool() {
    if (!memory_pool) return;
    
    printf("Cleaning up memory pool...\n");
    printf("Total allocations tracked: %d\n", memory_pool->count);
    printf("Total memory allocated: %zu bytes\n", memory_pool->total_allocated);
    
    for (int i = 0; i < memory_pool->count; i++) {
        if (memory_pool->blocks[i]) {
            free(memory_pool->blocks[i]);
        }
    }
    
    free(memory_pool->blocks);
    free(memory_pool->sizes);
    free(memory_pool);
    memory_pool = NULL;
    
    printf("Memory pool cleaned up successfully\n");
}

int main() {
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);

    SOCKET server = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(server, SOL_SOCKET, SO_REUSEADDR, (char*)&opt, sizeof(opt));

    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(3000);
    addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(server, (struct sockaddr *)&addr, sizeof(addr)) == SOCKET_ERROR) {
        printf("Bind failed with error: %d\n", WSAGetLastError());
        cleanup_memory_pool();
        return 1;
    }

    listen(server, 5);
    GetSystemTimeAsFileTime(&last_check_time);

    printf("Started at http://localhost:3000\n");
    signal(SIGINT, (void(*)(int))cleanup_memory_pool);

    while (1) {
        SOCKET client = accept(server, NULL, NULL);
        if (client == INVALID_SOCKET) continue;
        
        char *buffer = (char*)smart_malloc(2048);
        fast_memset(buffer, 0, 2048);
        
        int bytes_received = recv(client, buffer, 2047, 0);
        
        if (bytes_received > 0) {
            char method[8], path[1024];
            sscanf(buffer, "%s %s", method, path);
            
            printf("Request: %s %s\n", method, path);
            
            check_files_modified();
            
            if (strcmp(path, "/reload") == 0) {
                serve_reload(client);
            } else if (strcmp(path, "/live-reload.js") == 0) {
                serve_live_script(client);
            } else if (strcmp(path, "/memory-stats") == 0) {
                char *stats = (char*)smart_malloc(512);
                int stats_len = snprintf(stats, 512,
                    "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n"
                    "{\"total_allocated\":%zu,\"active_blocks\":%d,\"pool_capacity\":%d}",
                    memory_pool ? memory_pool->total_allocated : 0,
                    memory_pool ? memory_pool->count : 0,
                    memory_pool ? memory_pool->capacity : 0);
                send(client, stats, stats_len, 0);
                smart_free(stats);
            } else {
                char *file = path + 1;
                if (fast_strlen(file) == 0) file = "index.html";
                serve_file(client, file);
            }
        }

        smart_free(buffer);
        closesocket(client);
    }

    cleanup_memory_pool();
    closesocket(server);
    WSACleanup();
    return 0;
}

/*  Compile using 
    gcc -O2 Execute.c -o Execute.exe -lws2_32
    Than open localhost:3000
*/  