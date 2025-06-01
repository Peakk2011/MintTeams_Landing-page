// Content.ts Example to making content inside this file

export const WebElements = {
    StoredFontFamily: "@import url('https://fonts.googleapis.com/css2?family=Anuphan:wght@100..700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Inter+Tight:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Manrope:wght@200..800&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&family=Trirong:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');",
    Typeface: {
        InterTight: '"Inter Tight", sans-serif;',
        Merriweather: '"Merriweather", serif;',
        Trirong: '"Trirong", serif;',
        Anuphan: '"Anuphan", sans-serif;',
        JetBrainsMono: '"JetBrains Mono", monospace;',
        Manrope: '"Manrope", sans-serif;',
        InstrumentSans: '"Instrument Sans", sans-serif;',
        SourceSerif4: '"Source Serif 4", serif;',
    },
    Units: {
        CSSPosition: ['static', 'relative', 'fixed', 'absolute', 'sticky'],
        CSSSize: {
            AbsoluteLengths: {
                StaticCM: 'cm',
                StaticMM: 'mm',
                StaticIN: 'in',
                StaticPT: 'pt',
                StaticPC: 'pc',
                StaticPX: 'px'
            },
            RelativeLengths: {
                RelativeEM: 'em',
                RelativeREM: 'rem',
                RelativeVW: 'vw',
                RelativeVH: 'vh',
                RelativePERCENT: '%',
                RelativeVMAX: 'vmax',
            }
        }
    },
    get BorderRadius() {
        return {
            FullyRounded: `100${this.Units.CSSSize.RelativeLengths.RelativeVMAX};`,
            PrimaryRounded: `0.8${this.Units.CSSSize.RelativeLengths.RelativeREM};`,
            NavbarRounded: `10.5${this.Units.CSSSize.AbsoluteLengths.StaticPX};`
        };
    }
}


export const MarkupContent = {
    PageTitle: 'Mint Teams',

    get NavbarTitle() {
        return this.PageTitle;
    },

    HTMLContent: {
        NavbarLinks: [
            { text: 'Works', href: '/works' },
            { text: 'About Mint Teams', href: '/about' },
            { text: 'Contact', href: '/contact' }
        ]
    },

    StaticCSSvalues: {
        navbarHeight: '50px',
        navbarPadding: '0rem 0.8rem',
        navbarLinksPadding: '0rem 0.65rem',
        private_navbarWidth: '550px',
        CenterPositions: {
            CALL: `${WebElements.Units.CSSPosition[3]}`,
            PositionY: `
                top: 50%;
                transform: translateY(-50%);
            `,
            PositionX: `
                left: 50%;
                transform: translateX(-50%);
            `,
            get CALLPosition() {
                return `
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                `;
            }
        },
    },

    CSScolor: {
        ColorPrimary: '#faf8f0;',
        TextColorPrimary: '#000;',
        NavbarPrimary: '#f5f4ed;',
        NavbarBorderPrimary: 'solid 1px #d6d6ce',
    },

    Navbar() {
        return `
            <nav>
                <div class="NavContent">
                    <div class="NavText">
                        <img src="../image/MintTeamsLogoSVG.svg">
                        <p>${this.NavbarTitle}</p>
                    </div>
                    <div class="NavLinks">
                        ${this.HTMLContent.NavbarLinks.map(link => `<li><a href="${link.href}">${link.text}</a></li>`).join('')}
                    </div>
                </div>
            </nav>
        `;
    },

    CSSnavbar() {
        return `
            nav {
                position: ${WebElements.Units.CSSPosition[2]};
                top: 20px;
                width: ${this.StaticCSSvalues.private_navbarWidth};
                height: ${this.StaticCSSvalues.navbarHeight};
                background-color: ${this.CSScolor.NavbarPrimary};
                border: ${this.CSScolor.NavbarBorderPrimary};
                ${this.StaticCSSvalues.CenterPositions.PositionX};
                border-radius: ${WebElements.BorderRadius.NavbarRounded};
            }

            .NavContent {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: ${this.StaticCSSvalues.navbarPadding};
            }

            .NavText {
                display: flex;
                align-items: center;
                height: ${this.StaticCSSvalues.navbarHeight};
                font-family: ${WebElements.Typeface.JetBrainsMono};
            }

            .NavText img {
                width: 22.5px;
                height: auto;
                margin-right: 0.5rem;
            }

            .NavLinks {
                display: flex;
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .NavLinks a {
                text-decoration: none !important;   
                color: ${this.CSScolor.TextColorPrimary};
                padding: ${this.StaticCSSvalues.navbarLinksPadding};
                font-family: ${WebElements.Typeface.InstrumentSans};
                letter-spacing: -0.3px;
            }
        `
    }
}

/*  Pseudo Assembly + JavaScript Architecture Flow

    ;--- WebElements: CSS ---
    DEFINE WebElements
        StoredFontFamily      ; @import Google Fonts
        Typeface             ; Types of fonts
        Units                ; CSS Unit of measurement
        BorderRadius         ; Function return to CSS border-radius

    ;--- MarkupContent: Content of web ---
    DEFINE MarkupContent
        PageTitle            ; Page title
        NavbarTitle          ; getter return PageTitle
        HTMLContent          ; Navbar content or any thing on web
        StaticCSSvalues      ; Static CSS values (Like, padding, center)
        CSScolor             ; Color CSS Values
        Navbar()             ; Return HTML Navbar
        CSSnavbar()          ; Return CSS Navbar

    ;--- (Pseudo Assembly + JS) ---
    MOV EAX, WebElements.Typeface.JetBrainsMono
    MOV EBX, WebElements.StoredFontFamily
    MOV ECX, MarkupContent.PageTitle
    MOV EDX, MarkupContent.Navbar()         
    MOV ESI, MarkupContent.CSSnavbar()      

    ; Inject font-family
    CALL injectCSS(EBX + ESI)               ; injectCSS(WebElements.StoredFontFamily + MarkupContent.CSSnavbar())
    CALL injectHTML('#app', EDX)            ; injectHTML('#app', MarkupContent.Navbar())

    ; Set title on web
    CALL injectTitle('<title>' + ECX + '</title>')

    ; Warning
    ; - WebElements is a utility for CSS/Font
    ; - MarkupContent Global content
    ; - All thing inject from Mint (or global)

*/