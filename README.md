# Tag Templater

An Obsidian plugin that automatically creates notes from templates when you add specific tags to your content.

## Features

- Automatically creates notes when you type configured tags in your content
- Each tag can have its own template and settings
- Smart filename generation from line content
- Support for nested/hierarchical tags (e.g., `#todo/urgent`)
- Automatically adds backlinks to source notes
- Ignores tags in frontmatter/metadata
- Only triggers on newly added tags (won't duplicate)
- Customizable output folders per tag
- Configurable filename suffixes

## How It Works

1. Configure a tag (e.g., `todo`) with a template path
2. When you type `#todo` on a line in your note, the plugin detects it
3. A new note is automatically created using your template
4. The filename is based on the line content (e.g., "Buy groceries #todo" → "Buy groceries - Todo.md")
5. A backlink to the source note is added automatically

## Installation

### From Obsidian Community Plugins

1. Open Settings → Community plugins
2. Search for "Tag Templater"
3. Click Install, then Enable

### Manual Installation

1. Clone this repository or download the latest release
2. Copy `main.js`, `manifest.json`, and `styles.css` (if exists) to your vault's `.obsidian/plugins/tag-templater/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community plugins

## Development

### Building the Plugin

```bash
# Install dependencies
npm install

# Build for development (with watch mode)
npm run dev

# Build for production
npm run build
```

### Setup for Development

1. Clone this repo into your vault's `.obsidian/plugins/` folder
2. Run `npm install`
3. Run `npm run dev` to start compilation in watch mode
4. Make changes to the code
5. Reload Obsidian to see your changes

## Usage

### Basic Configuration

1. Open Settings → Tag Templater
2. Click "Add tag configuration"
3. Configure:
   - **Tag name**: The tag without # (e.g., "todo" for `#todo`)
   - **Template path**: Path to your template file (e.g., "Templates/Todo.md")
   - **Filename suffix**: Text to append to filenames (e.g., " - Todo")
   - **Output folder**: Where to create notes (leave empty for vault root)
   - **Enabled**: Toggle to enable/disable this configuration

### Example Configuration

**Tag Configuration:**
- Tag name: `todo`
- Template path: `Templates/Todo Template.md`
- Filename suffix: ` - Todo`
- Output folder: `Tasks`
- Enabled: Yes

**Template file** (`Templates/Todo Template.md`):
```markdown
## Task Details

Status: [ ] To Do

---

## Notes

```

**Usage:**
Type in any note:
```
Buy groceries #todo
```

**Result:**
A new note is created at `Tasks/Buy groceries - Todo.md` with:
```markdown
Created from: [[Original Note]]

## Task Details

Status: [ ] To Do

---

## Notes

```

### Nested Tags

You can use hierarchical tags for more specific configurations:

- Configure `todo/urgent` separately from `todo`
- `#todo/urgent` will match only the `todo/urgent` configuration
- `#todo` will match only the `todo` configuration

### Settings

- **Default output folder**: Fallback folder when tag config doesn't specify one
- **Enable notifications**: Show notifications when notes are created
- **Debounce delay**: Wait time (ms) before processing tag changes (default: 500)

**UI Enhancements:**
- Template paths support autocomplete (shows all .md files)
- Output folders support autocomplete (shows all folders)
- Template paths show visual validation (green=valid, red=invalid)

## Features in Detail

### Automatic Filename Sanitization

- Invalid filename characters are replaced with dashes
- Windows reserved names are handled
- Leading/trailing dots and dashes are removed
- Long filenames are truncated to 255 characters
- Empty filenames default to "Untitled"

### Duplicate Handling

If a file already exists with the same name:
- First occurrence: `Note.md`
- Second occurrence: `Note 1.md`
- Third occurrence: `Note 2.md`
- And so on...

### Smart Tag Detection

The plugin ignores tags in:
- Frontmatter/YAML metadata
- Inline code (`` `#tag` ``)
- Code blocks
- Obsidian comments (`%% #tag %%`)

### Backlinks

Every created note includes a backlink to the source:
```markdown
Created from: [[Source Note Name]]
```

This helps you track where notes originated from.

## Template Variables

Templates support dynamic placeholders that are automatically replaced when creating notes:

### Available Variables

- `{{date}}` - Current date (YYYY-MM-DD format)
- `{{time}}` - Current time (HH:MM format)
- `{{datetime}}` - Current date and time (YYYY-MM-DD HH:MM)
- `{{line}}` - Original line content without tags
- `{{tag}}` - The tag that triggered creation
- `{{filename}}` - Generated filename for the note
- `{{source}}` - Name of the source file

### Example Template with Variables

**Template file** (`Templates/Task.md`):
```markdown
---
created: {{datetime}}
tag: {{tag}}
source: [[{{source}}]]
---

# {{line}}

## Details

Created on {{date}} at {{time}}

---

## Notes

```

**Usage:**
Type in any note:
```
Buy groceries #todo
```

**Created note** (`Tasks/Buy groceries - Todo.md`):
```markdown
---
created: 2025-12-29 14:30
tag: todo
source: [[Daily Notes]]
---

# Buy groceries

## Details

Created on 2025-12-29 at 14:30

---

## Notes

```

### Common Variable Patterns

**Daily Note Template:**
```markdown
# {{line}}

Created: {{datetime}}
From: [[{{source}}]]
```

**Meeting Notes:**
```markdown
# Meeting: {{line}}

**Date:** {{date}}
**Time:** {{time}}
**Tag:** #{{tag}}
```

## Troubleshooting

**Notes aren't being created:**
- Check that the tag configuration is enabled
- Verify the template path is correct
- Ensure you're adding the tag in content (not frontmatter)
- Check that the tag name matches exactly (without #)

**Template not found error:**
- Verify the template file exists at the specified path
- Check for typos in the template path
- Use forward slashes in paths (e.g., `Templates/Todo.md`)

**Duplicate notes being created:**
- This only happens if you manually add the same tag again
- Existing tags won't trigger creation
- File state is cleared when you close Obsidian

## Frequently Asked Questions

### Does this work with nested tags?
Yes! You can configure `#todo/urgent` separately from `#todo`. Each tag configuration is matched exactly.

### Will tags in code blocks trigger note creation?
No, the plugin ignores tags in:
- Inline code (`` `#tag` ``)
- Code blocks
- Obsidian comments (`%% #tag %%`)
- YAML frontmatter

### What happens if I add the same tag twice?
The plugin tracks which tags have been processed on each line. Adding the same tag again on the same line won't create a duplicate note. However, if you add it on a new line, it will trigger again.

### Can I use the same template for multiple tags?
Yes! Multiple tag configurations can share the same template path.

### What if my template file doesn't exist?
The plugin validates template paths and shows a notification if the template isn't found. With template path validation enabled (in settings), invalid paths are highlighted in red.

### How are filenames generated?
Filenames are created from the line content (without tags), with invalid characters replaced by dashes. If a file already exists, a number is appended (e.g., "Note 1.md", "Note 2.md").

### Can I disable notifications?
Yes, go to Settings → Tag Templater and toggle "Enable notifications" off.

### Does this slow down typing?
No, the plugin uses debouncing (default 500ms delay) to avoid processing every keystroke. You won't notice any performance impact during normal typing.

## Support

If you encounter any issues or have feature requests, please file an issue on the GitHub repository.

## License

MIT
