// Content.js Example to making content inside this file

const MarkupContent = {
    PageTitle: 'Mint Teams',
    get NavbarTitle() {
        return this.PageTitle;
    },

    StaticCSSvalues: {
        navbarHeight: '55px',
        navbarMaxHeight: '0rem 1rem',
    },

    CSScolor: {
        ColorPrimary: '#faf8f0',
        NavbarPrimary: '#f5f4ed',
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
                </div>
            </nav>
        `;
    },

    CSSnavbar() {
        return `
            nav {
                position: fixed;
                top: 0;
                width: 100%;
                height: ${this.StaticCSSvalues.navbarHeight};
                background-color: #f5f4ed;
                border-bottom: ${this.CSScolor.NavbarBorderPrimary};
            }

            .NavContent {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: ${this.StaticCSSvalues.navbarMaxHeight};
            }

            .NavText {
                display: flex;
                align-items: center;
                height: ${this.StaticCSSvalues.navbarHeight};
            }

            .NavText img {
                width: 25px;
                height: auto;
                margin-right: 0.5rem;
            }
        `
    }
}

export default MarkupContent;

/*  Pseudo Assembly + JavaScript Architecture Flow

    DEFINE MarkupContent       ; Register block (like memory struct)
        - Navbar()             ; Function to return HTML block
        - CSSnavbar()          ; Function to return CSS  block
        - StaticCSSvalues      ; Constant object for shared style

    MOV StaticCSSvalues, EAX      ; Simulates the variables in the cpu register, which is EAX
    MOV EDX, Navbar() CSSnavbar() ; Simulates the methods in the cpu register, which is EDX
    MOV EDX EAX                   ; Can provide an overview, such as using static values ​​to make it able to calculate that value

*/