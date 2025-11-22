"use client";

import { useEffect } from 'react';
import Script from 'next/script';

export function AdScripts() {
    useEffect(() => {
        // Script 1: smoggy-construction (Head)
        try {
            (function (xwl: any) {
                var d = document,
                    s = d.createElement('script') as any,
                    l = d.scripts[d.scripts.length - 1];
                s.settings = xwl || {};
                s.src = "//smoggy-construction.com/b/X/VosBd.Gsl/0FYmWhcn/veamR9-uAZHUxlFkCPUTJYL0eMYzyUz0FNFj/M/tRNxj/Q/zqNZTKQV2/NcAv";
                s.async = true;
                s.referrerPolicy = 'no-referrer-when-downgrade';
                if (l && l.parentNode) {
                    l.parentNode.insertBefore(s, l);
                } else {
                    document.head.appendChild(s);
                }
            })({});
        } catch (e) {
            console.error("Error injecting script 1", e);
        }

        // Script 2: rare-reveal (Head)
        try {
            (function (wxhzk: any) {
                var d = document,
                    s = d.createElement('script') as any,
                    l = d.scripts[d.scripts.length - 1];
                s.settings = wxhzk || {};
                s.src = "//rare-reveal.com/cjDJ9z6Sb.2U5Xl/S-WkQg9VNZjNQbziNcTmQ_yvNciq0_2DNiDUMz1kNEDzId3K";
                s.async = true;
                s.referrerPolicy = 'no-referrer-when-downgrade';
                if (l && l.parentNode) {
                    l.parentNode.insertBefore(s, l);
                } else {
                    document.head.appendChild(s);
                }
            })({});
        } catch (e) {
            console.error("Error injecting script 2", e);
        }
    }, []);

    return (
        <>
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7546609873197379"
                crossOrigin="anonymous"
                strategy="afterInteractive"
            />
        </>
    );
}
