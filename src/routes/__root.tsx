import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Yard";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: APP_NAME },
      { name: "theme-color", content: "#101311" },
      {
        name: "description",
        content:
          "Pull a full 3D game, drive it in Chrome, and fork the handling into your own pack.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.__yardHeld=new Set();window.__controlsTest={setKeys:function(c){window.__yardHeld=new Set(c||[])},setSteer:function(v){window.__yardSteer=v},getYaw:function(){return window.__yardYaw||0},getSpeed:function(){return window.__yardSpeed||0}};document.addEventListener('click',function(e){var n=e.target&&e.target.closest&&e.target.closest('[data-yard-start]');if(!n)return;window.__yardQueued=n.getAttribute('data-yard-start');if(window.__yardBoot)window.__yardBoot();},true);",
          }}
        />
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
