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

## Support

If you encounter any issues or have feature requests, please file an issue on the GitHub repository.

## License

MIT
