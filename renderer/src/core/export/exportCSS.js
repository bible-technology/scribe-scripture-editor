/* eslint-disable no-tabs */
export const css_1_col_ltr = `<style >
body {
    margin: 0;
    padding: 0;
}
p {
    font-size: 100%;
}

.newspaper ul li ol li:before {
    font-size: 62%  /* Adjusts verse number size. */
}

 .chapter {
    font-size: 180%;  /* Adjusts chapter number size. */
    }

p {
    font-family: Helvetica;
}

/* Minor: Changed ".body" (class) to "body" (element) */  
body {
    background-color: #f5f8fa;
    line-height: 100%;
}

.newspaper {
    -webkit-column-count: 1;
    -moz-column-count: 1;
    column-count: 1;
}  /* Note: margin-right was previously set in additional .newspaper{} at the end of CSS.  It is now commented out as FF was increasing this recursively +2px to each page on print. */

.chapter {
    display: inline-block;
    margin-left: 4px;
    float: left;
    text-align: right;
    margin-right: 5px;
}

.list {
    margin: 0 auto;
    padding-top: 0px;
}

.newspaper ul {
    float: left;
    width: 100%;
}

.newspaper ul li {
    list-style: none;
  //float: left;  /* Chapter #'s out of place in FF on print if included. */
    display: block;
    width: 100%;
    margin-right: 0px;
}

.newspaper ul li ol {
    counter-reset: item;
    list-style-type: none;
    margin: 0;
    padding: 0;
    margin-left: -16px;
}

.newspaper ul li ol li {
    display: table;
    //float: left;  /* Chapter #'s out of place in FF on print if included */
    width: 100%;
/*********************************************************/
/* Keeps numbers with verse at page-break on print.      */
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
/*********************************************************/
}

.newspaper ul li ol li:before{
    width: 3%;
    float: left;
    font-weight: bold;
    content: counter(item) " ";
    counter-increment: item;
    margin-right: 8px;
    padding-left: 10px;
    text-align: right;
}

.newspaper ul li ol li p {
    width: 90%;
    margin:0 0 10px 0;
    padding: 0 29px 0px 0px;
    float: left;
    box-sizing: border-box;
}

.verseDiv {
    padding-left: 5%;
    line-height: 125%;
    margin-right: 3%;
}

.verseSpan {
    margin-right: 8px;
    float: left;
    font-size: 62%;
    font-weight: bold;
}

.firstLi {
    margin-bottom: 8px;
    line-height: 20px;
    width: 80%
}  /* Note: display is set in additional .firstLi{} at the end of CSS */

/* Note: Did not review @media...{} settings. */

@media only screen and (max-width: 1024px) {
    .newspaper ul li ol li p {
        width: 80%;
        margin: 0 0 10px 0;
        padding: 0 8px 0px 0px;
        float: left;
        line-height: 20px;
        box-sizing: border-box;
    }
    .newspaper ul li {
        list-style: none;
        float: left;
        display: block;
        width: 90%;
        padding-right: 21px;
    }
    .chapter {
            margin-right: 6px;
        width: 18%;
    }
          }
    @media only screen and (max-width: 768px) {
    .chapter {
        margin-right: 4px;
        width: 31%;
    }
}

@media only screen and (max-width: 700px) {
    .newspaper ul li ol li p {
        width: 70%;
    }
    .newspaper ul li ol li span {
        width: 7%;
    }
    .chapter {
        display: inline-block;
        float: right;
        text-align: center;
        margin-right: 12px;
        width: 100%;
    }
}

.newspaper {
    //margin-right: 2px  /* FF increases this recursively +2px to each page on print. */
}

.firstLi {
    display: inline-flex;
}
.prespace {
    white-space: pre-wrap
}
</style>`;

export const css_2_col_ltr = `<style >
body {
    margin: 0;
    padding: 0;
}
p {
    font-size: 100%;
}

.newspaper ul li ol li:before {
    font-size: 62%     /* Adjusts verse number size. */
}

 .chapter {
    font-size: 180%;  /* Adjusts chapter number size. */
    }

p {
    font-family: Helvetica;
}

/* Minor: Changed ".body" (class) to "body" (element) */ 
body {
    background-color: #f5f8fa;
    line-height: 100%;
}

.newspaper {
    -webkit-column-count: 2;
    -moz-column-count: 2;
    column-count: 2;
}  /* Note: margin-right was previously set in additional .newspaper{} at the end of CSS.  It is now commented out as FF was increasing this recursively +2px to each page on print. */

.chapter {
    display: inline-block;
    margin-left: -6px;  /* Changed to match 1-col alignment with verse numbers on print. */
    float: left;
    text-align: right;
    margin-right: 5px;
}

.list {
    margin: 0 auto;
    padding-top: 0px;
}

.newspaper ul {
    float: left;
    width: 100%;
}

.newspaper ul li {
    list-style: none;
//            float: left;    /* Remove for FF on print */
    display: block;
    width: 100%;
    margin-right: 0px;
}

.newspaper ul li ol {
    counter-reset: item;
    list-style-type: none;
    margin: 0;
    padding: 0;
    margin-left: -16px;
}

.newspaper ul li ol li {
    display: table;
//            float: left;    /* Remove for FF on print */
    width: 100%;
/************************************************************************/
/* Keeps numbers with verse at page/column-break on print.        */
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
    break-inside: avoid;
/************************************************************************/
}

.newspaper ul li ol li:before {
    width: 3%;
    float: left;
    font-weight: bold;
    content: counter(item) " ";
    counter-increment: item;
    margin-right: 8px;
    padding-left: 10px;
    text-align: right;
}

.newspaper ul li ol li p {
    width: 90%;
    margin:0 0 10px 0;
    padding: 0 29px 0px 0px;
    float: left;
    box-sizing: border-box;
}

.verseDiv {
    padding-left: 5%;
    line-height: 125%;
    margin-right: 3%;
}

.verseSpan {
    margin-right: 8px;
    float: left;
    font-size: 62%;
    font-weight: bold;
}

.firstLi {
    margin-bottom: 8px;
    line-height: 20px;
    width: 80%
}  /* Note: display is set in additional .firstLi{} at the end of CSS */

/* Note: Did not review @media...{} settings. */

@media only screen and (max-width: 1024px) {
    .newspaper ul li ol li p {
        width: 80%;
        margin: 0 0 10px 0;
        padding: 0 8px 0px 0px;
        float: left;
        line-height: 20px;
        box-sizing: border-box;
    }
    .newspaper ul li {
        list-style: none;
        float: left;
        display: block;
        width: 90%;
        padding-right: 21px;
    }
    .chapter {
            margin-right: 6px;
        width: 18%;
    }
          }
    @media only screen and (max-width: 768px) {
    .chapter {
        margin-right: 4px;
        width: 31%;
    }
}

@media only screen and (max-width: 700px) {
    .newspaper ul li ol li p {
        width: 70%;
    }
    .newspaper ul li ol li span {
        width: 7%;
    }
    .chapter {
        display: inline-block;
        float: right;
        text-align: center;
        margin-right: 12px;
        width: 100%;
    }
}

.newspaper {
//            margin-right: 2px  /* FF increases this recursively +2px to each page on print. */
}

.firstLi {
    display: inline-flex;
}
.prespace {
    white-space: pre-wrap
}

</style>`;

export const css_1_col_rtl = `<style>
    body {
        margin: 0;
        padding: 0;
    }
    p {
        font-size: 100%;
    }

    /* Changed to the same approach as used in RTL.      */
    /*     .newspaper ul li ol li span {    */
    .newspaper ul li ol li:before {
        font-size: 62%    /* Adjusts verse number size. */
    }

    .chapter {
    //            font-size: 35px;  /* Reverted back to original % approach. */
        font-size: 180%;  /* Adjusts chapter number size. */
    }

    p {
    font-family: Awami Nastaliq;
    }

    /* Minor: Changed ".body" (class) to "body" (element) */
    body {
        background-color: #f5f8fa;
    }

    .newspaper {
        -webkit-column-count: 1;
        -moz-column-count: 1;
        column-count: 1;
    }

    /* Adding this (mirroring LTR) moves the chapter numbers over slightly */
                .chapter {
                    display: inline-block;
                    margin-right: 4px;
                    float: right;
                    text-align: left;
                    margin-left: 5px;
                }

    .list {
        margin: 0 auto;
        padding-top: 0px;  /* Changed padding-top from 5px to 0px on RTL like on LTR. */
    }

    .newspaper ul {
        float: right;
        width: 100%;
    }

    .newspaper ul li {
        list-style: none;
    //            float: right;      /* Remove for FF on print */
        display: block;
        width: 100%;
        margin-left: 0px;  /* Changed right to left to mirror LTR, though may not really matter at 0px */
    }

    .newspaper ul li ol {
        counter-reset: item;
        list-style-type: none;
        margin: 0;
        padding: 0;
        margin-right: -16px; /* Adding this mirrors LTR and pulls verses and numbers to the right. */
    }

    .newspaper ul li ol li {
        display: table;
    //            float: right;  /* Remove for FF on print */
        width: 100%;
    /*********************************************************/
    /* Keeps numbers with verse at page-break on print.      */
        -webkit-column-break-inside: avoid;
        page-break-inside: avoid;
        break-inside: avoid;
    /*********************************************************/
    }

    .newspaper ul li ol li:before {
        width: 3%;
        float: right;
        font-weight: bold;
        content: counter(item, decimal) "  ";
        counter-increment: item;
    //            margin-top: 3px;      /* Remove to mirror LTR.*/
    //            font-size:14px : 14px;  /* Remove to mirror LTR.*/
        margin-left: 8px;      /* Add to mirror LTR.  */
        padding-right: 10px;    /* Add to mirror LTR.  */
        text-align: left;      /* Add to mirror LTR.  */
    }

    .newspaper ul li ol li p {
        width: 90%;
        margin: 0 0 10px 0;
        padding: 0 0 0 29px;  /* Changed to mirror LTR.  */
        float: right;
        box-sizing: border-box;
        text-align: right;
    }

    .verseDiv {
        padding-right: 5%;
        line-height: 125%;
        margin-left: 3%;
    }

    .verseSpan {
        margin-left: 8px;
        float: right;
        font-size: 62%;
        font-weight: bold;
    }

    /* Comment this out to match the LTR design. */
    /*      ul li span.chapter { float: right; display: inline-block !important; min-height: 11px; width: 6%;} */

    .firstLi {
    margin-bottom: 8px;  /* Added to mirror LTR.    */
    //    float: right;    /* Remove for FF on print.  */
    display: table;   /* Added.          */
    text-align: right;
    margin-right: 0px;
    width: 60%
    }
    .prespace {
        white-space: pre-wrap
    }

</style>`;

export const css_2_col_rtl = `<style>
    body {
        margin: 0;
        padding: 0;
    }
    p {
        font-size: 100%;
    }

    /* Changed to the same approach as used in RTL.      */
    /*     .newspaper ul li ol li span {    */
    .newspaper ul li ol li:before {
        font-size: 62%    /* Adjusts verse number size. */
    }

    .chapter {
    //            font-size: 35px;  /* Reverted back to original % approach. */
        font-size: 180%;  /* Adjusts chapter number size. */
    }

    p {
    font-family: Awami Nastaliq;
    }

    /* Minor: Changed ".body" (class) to "body" (element) */ 
    body {
        background-color: #f5f8fa;
    }

    .newspaper {
        -webkit-column-count: 2;
        -moz-column-count: 2;
        column-count: 2;
    }

    /* Adding this (mirroring LTR) moves the chapter numbers over slightly */
        .chapter {
            display: inline-block;
            margin-right: -6px;
            float: right;
            text-align: left;
            margin-left: 5px;
        }

    .list {
        margin: 0 auto;
        padding-top: 0px;  /* Changed padding-top from 5px to 0px on RTL like on LTR. */
    }

    .newspaper ul {
        float: right;
        width: 100%;
    }

    .newspaper ul li {
        list-style: none;
    //            float: right;    /* Remove for FF on print */
        display: block;
        width: 100%;
        margin-left: 0px;  /* Changed right to left and 16px to 0px to mirror LTR. */
    }

    .newspaper ul li ol {
        counter-reset: item;
        list-style-type: none;
        margin: 0;
        padding: 0;
        margin-right: -16px; /* Adding this mirrors LTR and pulls verses and numbers to the right. */
    }

    .newspaper ul li ol li {
        display: table;
    //            float: right;  /* Remove for FF on print */
        width: 100%;
    /***********************************************************/
    /* Keeps numbers with verse at page/column-break on print. */
        -webkit-column-break-inside: avoid;
        page-break-inside: avoid;
        break-inside: avoid;
    /***********************************************************/
    }

    .newspaper ul li ol li:before {
        width: 3%;
        float: right;
        font-weight: bold;
        content: counter(item, decimal) "  ";
        counter-increment: item;
    //            margin-top: 3px;      /* Remove to mirror LTR.*/
    //            font-size:14px : 14px;  /* Remove to mirror LTR.*/
        margin-left: 8px;      /* Add to mirror LTR.  */
        padding-right: 10px;    /* Add to mirror LTR.  */
        text-align: left;      /* Add to mirror LTR.  */
    }

    .newspaper ul li ol li p {
    width: 90%;
    margin: 0 0 10px 0;
    padding: 0 0 0 29px;  /* Changed to mirror LTR.  */
    float: right;
    box-sizing: border-box;
    text-align: right;
    }

    .verseDiv {
        padding-right: 5%;
        line-height: 125%;
        margin-left: 3%;
    }

    .verseSpan {
        margin-left: 8px;
        float: right;
        font-size: 62%;
        font-weight: bold;
    }

    /* Comment this out to match the LTR design. */
    /*        ul li span.chapter { float: right; display: inline-block !important; min-height: 11px; width: 6%;}  */

    .firstLi {
    margin-bottom: 8px;  /* Added to mirror LTR.    */
    //        float: right;    /* Remove for FF on print.  */
    display: table;     /* Added.          */
    text-align: right;
    margin-right: 0px;  /* Changed 23px to 0px */
    width: 60%
    }
    .prespace {
        white-space: pre-wrap
    }
    </style>`;
