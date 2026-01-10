import { App, PluginSettingTab, Setting } from "obsidian";
import TagTemplaterPlugin from "../main";
import {
  TemplatePathSuggest,
  addValidationIndicator,
} from "./ui/TemplatePathSuggest";
import { FolderPathSuggest } from "./ui/FolderPathSuggest";

export class TagTemplaterSettingTab extends PluginSettingTab {
  plugin: TagTemplaterPlugin;

  constructor(app: App, plugin: TagTemplaterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // Default output folder setting
    new Setting(containerEl)
      .setName("Default output folder")
      .setDesc("Default folder for created notes (leave empty for vault root)")
      .addText((text) => {
        text
          .setPlaceholder("Folder/path")
          .setValue(this.plugin.settings.defaultOutputFolder)
          .onChange(async (value) => {
            this.plugin.settings.defaultOutputFolder = value;
            await this.plugin.saveSettings();
          });

        // Attach folder autocomplete
        new FolderPathSuggest(this.app, text.inputEl);
      });

    // Enable notifications setting
    new Setting(containerEl)
      .setName("Enable notifications")
      .setDesc("Show notifications when notes are created")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableNotifications)
          .onChange(async (value) => {
            this.plugin.settings.enableNotifications = value;
            await this.plugin.saveSettings();
          }),
      );

    // Debounce delay setting
    new Setting(containerEl)
      .setName("Debounce delay")
      .setDesc(
        "Delay in milliseconds before processing tag changes (default: 500)",
      )
      .addText((text) =>
        text
          .setPlaceholder("500")
          .setValue(String(this.plugin.settings.debounceDelay))
          .onChange(async (value) => {
            const numValue = parseInt(value);
            if (!isNaN(numValue) && numValue >= 0) {
              this.plugin.settings.debounceDelay = numValue;
              await this.plugin.saveSettings();
            }
          }),
      );

    // Tag configurations section
    new Setting(containerEl)
      .setName("Tag configurations")
      .setDesc(
        "Configure which tags trigger note creation and their templates.",
      )
      .setHeading();

    // Display existing tag configs
    for (let i = 0; i < this.plugin.settings.tagConfigs.length; i++) {
      this.displayTagConfig(containerEl, i);
    }

    // Add new tag config button
    new Setting(containerEl).addButton((button) =>
      button
        .setButtonText("Add tag configuration")
        .setCta()
        .onClick(async () => {
          this.plugin.settings.tagConfigs.push({
            tagName: "",
            templatePath: "",
            filenameSuffix: "",
            outputFolder: "",
            enabled: true,
          });
          await this.plugin.saveSettings();
          this.display(); // Refresh the settings display
        }),
    );
  }

  private displayTagConfig(containerEl: HTMLElement, index: number): void {
    const config = this.plugin.settings.tagConfigs[index];

    const configContainer = containerEl.createDiv({
      cls: "tag-config-container",
    });

    // Tag config header with remove button
    const header = configContainer.createDiv({ cls: "tag-config-header" });

    new Setting(header)
      .setName(`Tag configuration ${index + 1}`)
      .addButton((button) =>
        button
          .setButtonText("Remove")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.tagConfigs.splice(index, 1);
            await this.plugin.saveSettings();
            this.display(); // Refresh the settings display
          }),
      );

    // Tag name
    new Setting(configContainer)
      .setName("Tag name")
      .setDesc(
        'Tag that triggers note creation (without #, e.g., "todo" or "todo/urgent")',
      )
      .addText((text) =>
        text
          .setPlaceholder("Todo")
          .setValue(config.tagName)
          .onChange(async (value) => {
            config.tagName = value.trim();
            await this.plugin.saveSettings();
          }),
      );

    // Template path
    new Setting(configContainer)
      .setName("Template path")
      .setDesc("Path to the template file (autocomplete available)")
      .addText((text) => {
        text
          .setPlaceholder("templates/todo.md")
          .setValue(config.templatePath)
          .onChange(async (value) => {
            config.templatePath = value.trim();
            await this.plugin.saveSettings();
          });

        // Attach autocomplete to the input element
        new TemplatePathSuggest(this.app, text.inputEl);

        // Add validation indicator
        addValidationIndicator(this.app, text.inputEl);
      });

    // Filename suffix
    new Setting(configContainer)
      .setName("Filename suffix")
      .setDesc("Text to append to generated filename")
      .addText((text) =>
        text
          .setPlaceholder(" - todo")
          .setValue(config.filenameSuffix)
          .onChange(async (value) => {
            config.filenameSuffix = value;
            await this.plugin.saveSettings();
          }),
      );

    // Output folder
    new Setting(configContainer)
      .setName("Output folder")
      .setDesc(
        "Folder for notes created with this tag (leave empty to use default)",
      )
      .addText((text) => {
        text
          .setPlaceholder("Todos")
          .setValue(config.outputFolder)
          .onChange(async (value) => {
            config.outputFolder = value.trim();
            await this.plugin.saveSettings();
          });

        // Attach folder autocomplete
        new FolderPathSuggest(this.app, text.inputEl);
      });

    // Enabled toggle
    new Setting(configContainer)
      .setName("Enabled")
      .setDesc("Enable or disable this tag configuration")
      .addToggle((toggle) =>
        toggle.setValue(config.enabled).onChange(async (value) => {
          config.enabled = value;
          await this.plugin.saveSettings();
        }),
      );

    configContainer.createEl("hr");
  }
}
