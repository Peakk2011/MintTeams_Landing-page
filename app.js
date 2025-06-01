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

console.log(Mint.MarkupContent.StaticCSSvalues.CenterPositions.CALLPosition);

const AcceptCurrentProgressive = () => {
    Mint.injectCSS(Mint.WebElements.StoredFontFamily + MainStylesheet);
    Mint.injectTitle(SetHTMLtitle);
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