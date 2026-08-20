(function () {
  const script =
    document.currentScript;

  if (!script) {
    console.error(
      "Widget loader: current script not found."
    );
    return;
  }

  const scriptUrl =
    new URL(script.src);

  const widgetId =
    scriptUrl.searchParams.get("id");

  if (!widgetId) {
    console.error(
      "Widget loader: missing widget id."
    );
    return;
  }

  const apiBase =
    scriptUrl.origin;

  function installStyles() {
    if (
      document.querySelector(
        "style[data-flyrank-widget-styles]"
      )
    ) {
      return;
    }

    const styles =
      document.createElement("style");

    styles.setAttribute(
      "data-flyrank-widget-styles",
      "v1"
    );

    styles.textContent = `
      .flyrank-widget {
        width: 100%;
        max-width: 460px;
        padding: clamp(24px, 5vw, 36px);
        border: 1px solid rgba(23, 32, 51, 0.09);
        border-radius: 24px;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #172033;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 30px 80px rgba(38, 51, 88, 0.16), 0 4px 14px rgba(38, 51, 88, 0.06);
        backdrop-filter: blur(16px);
      }
      .flyrank-widget *, .flyrank-widget *::before, .flyrank-widget *::after { box-sizing: border-box; }
      .flyrank-widget__badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 14px;
        color: #2457f5;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .09em;
        text-transform: uppercase;
      }
      .flyrank-widget__badge::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #2457f5; box-shadow: 0 0 0 4px rgba(36,87,245,.1); }
      .flyrank-widget h3 { margin: 0; color: #172033; font-size: clamp(25px, 4vw, 32px); line-height: 1.12; letter-spacing: -.04em; }
      .flyrank-widget__description { margin: 10px 0 26px; color: #667085; font-size: 14px; line-height: 1.6; }
      .flyrank-widget__field { margin-bottom: 17px; }
      .flyrank-widget label { display: flex; gap: 4px; margin-bottom: 7px; color: #344054; font-size: 13px; font-weight: 720; }
      .flyrank-widget__required { color: #2457f5; }
      .flyrank-widget input:not([name="website"]), .flyrank-widget textarea {
        display: block;
        width: 100%;
        min-height: 48px;
        padding: 12px 14px;
        border: 1px solid #d9deea;
        border-radius: 12px;
        outline: none;
        color: #172033;
        background: #fbfcfe;
        font: inherit;
        font-size: 14px;
        transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
      }
      .flyrank-widget textarea { min-height: 104px; resize: vertical; line-height: 1.5; }
      .flyrank-widget input:not([name="website"]):hover, .flyrank-widget textarea:hover { border-color: #b8c1d6; }
      .flyrank-widget input:not([name="website"]):focus, .flyrank-widget textarea:focus { border-color: #2457f5; background: #fff; box-shadow: 0 0 0 4px rgba(36,87,245,.11); }
      .flyrank-widget button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 50px;
        margin-top: 3px;
        padding: 12px 18px;
        border: 0;
        border-radius: 13px;
        cursor: pointer;
        color: #fff;
        background: linear-gradient(135deg, #2457f5, #5145d7);
        box-shadow: 0 11px 24px rgba(36,87,245,.24);
        font: inherit;
        font-size: 14px;
        font-weight: 780;
        transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
      }
      .flyrank-widget button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(36,87,245,.3); }
      .flyrank-widget button:focus-visible { outline: 3px solid rgba(36,87,245,.25); outline-offset: 3px; }
      .flyrank-widget button:disabled { cursor: wait; opacity: .68; }
      .flyrank-widget__message { min-height: 20px; margin: 13px 0 0; text-align: center; font-size: 13px; font-weight: 650; }
      .flyrank-widget__message--success { color: #087f5b; }
      .flyrank-widget__message--error { color: #c4324a; }
      .flyrank-widget__privacy { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 14px 0 0; color: #8a94a6; font-size: 11px; }
      @media (max-width: 480px) { .flyrank-widget { padding: 24px 18px; border-radius: 20px; } }
      @media (prefers-reduced-motion: reduce) { .flyrank-widget * { transition: none !important; } }
    `;

    document.head.appendChild(styles);
  }

  async function loadWidget() {
    try {
      const response = await fetch(
        `${apiBase}/api/public/widgets/${widgetId}/config`
      );

      if (!response.ok) {
        throw new Error(
          `Config request failed with ${response.status}`
        );
      }

      const config =
        await response.json();

      renderWidget(config);
    } catch (error) {
      console.error(
        "Widget failed to load:",
        error
      );
    }
  }

  function renderWidget(config) {
    installStyles();

    const container =
      document.createElement("div");

    container.setAttribute(
      "data-flyrank-widget",
      config.id
    );

    container.className =
      "flyrank-widget";

    const badge =
      document.createElement("div");

    badge.className =
      "flyrank-widget__badge";
    badge.textContent =
      "Let's build something great";

    container.appendChild(badge);

    const title =
      document.createElement("h3");

    title.textContent =
      config.title;

    container.appendChild(title);

    if (config.description) {
      const description =
        document.createElement("p");

      description.textContent =
        config.description;

      description.className =
        "flyrank-widget__description";

      container.appendChild(
        description
      );
    }

    const form =
      document.createElement("form");

    for (const field of config.fields) {
      const wrapper =
        document.createElement("div");

      wrapper.className =
        "flyrank-widget__field";

      const label =
        document.createElement("label");

      label.textContent = field.label;

      let input;

      if (field.type === "textarea") {
        input =
          document.createElement(
            "textarea"
          );
      } else {
        input =
          document.createElement(
            "input"
          );

        input.type =
          field.type === "tel"
            ? "tel"
            : field.type;
      }

      input.name = field.name;
      input.required =
        field.required;

      input.id =
        `flyrank-${config.id}-${field.name}`;
      label.htmlFor = input.id;

      if (field.required) {
        const required =
          document.createElement("span");
        required.className =
          "flyrank-widget__required";
        required.textContent = "*";
        required.setAttribute(
          "aria-hidden",
          "true"
        );
        label.appendChild(required);
      }

      input.placeholder =
        field.type === "email"
          ? "you@company.com"
          : field.type === "textarea"
            ? "Share a little about your project..."
            : `Enter your ${field.label.toLowerCase()}`;

      input.autocomplete =
        field.type === "email"
          ? "email"
          : field.type === "tel"
            ? "tel"
            : field.name === "name"
              ? "name"
              : "on";

      wrapper.appendChild(label);
      wrapper.appendChild(input);

      form.appendChild(wrapper);
    }

    // Honeypot
    const honeypot =
      document.createElement("input");

    honeypot.name = "website";
    honeypot.tabIndex = -1;
    honeypot.autocomplete = "off";
    honeypot.style.display = "none";

    form.appendChild(honeypot);

    const button =
      document.createElement("button");

    button.type = "submit";
    button.textContent =
      config.buttonText ||
      "Submit";

    form.appendChild(button);

    const message =
      document.createElement("p");

    message.className =
      "flyrank-widget__message";
    message.setAttribute(
      "role",
      "status"
    );
    message.setAttribute(
      "aria-live",
      "polite"
    );

    form.appendChild(message);

    const privacy =
      document.createElement("p");

    privacy.className =
      "flyrank-widget__privacy";
    privacy.textContent =
      "🔒 Your information stays private";

    form.appendChild(privacy);

    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        const formData =
          new FormData(form);

        const data = {};

        for (
          const field of config.fields
        ) {
          data[field.name] =
            formData.get(
              field.name
            );
        }

        const payload = {
          data,
          website:
            formData.get(
              "website"
            ) || "",
        };

        button.disabled = true;
        message.textContent =
          "Submitting...";
        message.className =
          "flyrank-widget__message";

        try {
          const response =
            await fetch(
              `${apiBase}/api/public/widgets/${widgetId}/submissions`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  "Idempotency-Key":
                    crypto.randomUUID(),
                },

                body:
                  JSON.stringify(
                    payload
                  ),
              }
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.error ||
                "Submission failed"
            );
          }

          message.textContent =
            "Thanks — your message is on its way.";
          message.className =
            "flyrank-widget__message flyrank-widget__message--success";

          form.reset();
        } catch (error) {
          message.textContent =
            "Unable to submit. Please try again.";
          message.className =
            "flyrank-widget__message flyrank-widget__message--error";

          console.error(error);
        } finally {
          button.disabled = false;
        }
      }
    );

    container.appendChild(form);

    if (script.parentNode) {
      script.parentNode.insertBefore(
        container,
        script.nextSibling
      );
    } else {
      document.body.appendChild(
        container
      );
    }
  }

  loadWidget();
})();
