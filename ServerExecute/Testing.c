// Html runner
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void open_html(const char *filename) {
    char cmd[512];
#ifdef _WIN32
    snprintf(cmd, sizeof(cmd), "start %s", filename);
#elif __APPLE__
    snprintf(cmd, sizeof(cmd), "open %s", filename);
#else
    snprintf(cmd, sizeof(cmd), "xdg-open %s", filename);
#endif
    system(cmd);
}

int main() {
    char input[256];

    while (1) {
        printf("Insert HTML files to run > ");
        fgets(input, sizeof(input), stdin);

        input[strcspn(input, "\n")] = 0;
        if (strcmp(input, "exit") == 0) {
            break;
        }
        if (strstr(input, ".html")) {
            open_html(input);
            continue;
        }
        if (strncmp(input, "run ", 4) == 0) {
            char *filename = input + 4;
            open_html(filename);
            continue;
        }

        printf("Unknown command: %s\n", input);
    }

    return 0;
}
