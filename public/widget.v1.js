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
    const container =
      document.createElement("div");

    container.setAttribute(
      "data-flyrank-widget",
      config.id
    );

    container.style.maxWidth = "360px";
    container.style.padding = "16px";
    container.style.border =
      "1px solid #d1d5db";
    container.style.borderRadius = "8px";
    container.style.fontFamily =
      "Arial, sans-serif";
    container.style.background = "#ffffff";

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

      container.appendChild(
        description
      );
    }

    const form =
      document.createElement("form");

    for (const field of config.fields) {
      const wrapper =
        document.createElement("div");

      wrapper.style.marginBottom =
        "10px";

      const label =
        document.createElement("label");

      label.textContent =
        field.label;

      label.style.display = "block";
      label.style.marginBottom = "4px";

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

      input.style.width = "100%";
      input.style.padding = "8px";

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

    form.appendChild(message);

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
            "Thank you!";

          form.reset();
        } catch (error) {
          message.textContent =
            "Unable to submit. Please try again.";

          console.error(error);
        } finally {
          button.disabled = false;
        }
      }
    );

    container.appendChild(form);

    document.body.appendChild(
      container
    );
  }

  loadWidget();
})();