import { Mint } from './lib/mint.js';

const SetHTMLtitle = `
    <title>${Mint.MarkupContent.PageTitle}</title>
`

const MainStylesheet = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        background-color: ${Mint.MarkupContent.CSScolor.ColorPrimary};
    }
    ${Mint.MarkupContent.CSSnavbar()}
`;

const Main = Mint.createState();

Main.subscribe(state => {
    const html = `
        <div>
            ${Mint.MarkupContent.Navbar()}
        </div>
    `;
    Mint.injectHTML('#app', html);
});

const AcceptCurrentProgressive = () => {
    Mint.injectCSS(MainStylesheet);
    Mint.injectTitle(SetHTMLtitle);
    // injectCSS(MarkupContent.CSSnavbar());
    // Or use this instend of ${MarkupContent.CSSnavbar()} in MainStylesheet on line 9
    Main.set(s => s);
}

const AdjustHook = () => {
    setInterval(() => {
        fetch("/reload")
            .then((res) => res.json())
            .then((data) => {
                if (data.reload) location.reload();
            });
    }, 1000);
}

AdjustHook();
AcceptCurrentProgressive();

/*  LOGIG C Pseudo Code

    import = #include </lib/MintUtils.js>
            :#include </lib/InjectElement.js> 
            :#include </lib/Content.js>
    const SetHTMLtitle    = #define SetHTMLtitle
    const MainStylesheet  = #define MainStylesheet
    
    ; Define language that varaibale using
    MOV SetHTMLtitle, injectHTML      
    MOV MainStylesheet, injectCSS      

    const Main = createState();   ; Define program entry points
    Look like  int "entry point"  ; Example with C programming

    Main.subscribe(state => {});  ; Fully entry point called
    
    MOV Main, Main.subscribe(state => {});
    CALL AcceptCurrentProgressive 
    ; return 0 to know that end session of program
    ; That will be called essentials progressive that you make
    
*/
