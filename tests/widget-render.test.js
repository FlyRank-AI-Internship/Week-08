import fs from "node:fs/promises";

import {
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  JSDOM,
} from "jsdom";

describe(
  "Embeddable widget",
  () => {
    test(
      "renders configured form",
      async () => {
        const dom =
          new JSDOM(
            `
            <!DOCTYPE html>
            <html>
              <body></body>
            </html>
            `,
            {
              url:
                "http://localhost:5500",
              runScripts:
                "outside-only",
            }
          );

        const scriptElement =
          dom.window.document
            .createElement(
              "script"
            );

        scriptElement.src =
          "http://localhost:3000/widget.v1.js?id=test-widget";

        Object.defineProperty(
          dom.window.document,
          "currentScript",
          {
            value:
              scriptElement,
            configurable: true,
          }
        );

        dom.window.fetch =
          vi.fn()
            .mockResolvedValue({
              ok: true,

              json:
                async () => ({
                  id:
                    "test-widget",

                  title:
                    "Contact Us",

                  description:
                    "Send us a message",

                  buttonText:
                    "Send",

                  fields: [
                    {
                      name:
                        "name",
                      label:
                        "Name",
                      type:
                        "text",
                      required:
                        true,
                    },

                    {
                      name:
                        "email",
                      label:
                        "Email",
                      type:
                        "email",
                      required:
                        true,
                    },
                  ],
                }),
            });

        const source =
          await fs.readFile(
            new URL(
              "../public/widget.v1.js",
              import.meta.url
            ),
            "utf8"
          );

        dom.window.eval(
          source
        );

        // Allow promise chain to finish.
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              20
            )
        );

        const widget =
          dom.window.document
            .querySelector(
              '[data-flyrank-widget="test-widget"]'
            );

        expect(
          widget
        ).not.toBeNull();

        expect(
          widget
            .querySelector("h3")
            .textContent
        ).toBe(
          "Contact Us"
        );

        expect(
          widget.querySelector(
            'input[name="email"]'
          )
        ).not.toBeNull();

        expect(
          widget.querySelector(
            'button[type="submit"]'
          ).textContent
        ).toBe(
          "Send"
        );
      }
    );
  }
);