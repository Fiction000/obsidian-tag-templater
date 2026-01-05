# Tag Templater

Create new notes instantly without breaking your writing flow. Just add a tag, and the right template is applied automatically.

## Why you need this

This plugin keeps you in the flow of writing when creating a new note. In typical scenario, you create the wiki link [[like this]] -> go to the created note -> then choose from the template. This plugin automates this process based on what tag you applied to the line you just written so that you don't get interrupted by thinking like "what template do I use for this note?".

## Features

![obsidian-tag-templater-flow](https://github.com/user-attachments/assets/3bd67531-a33c-40d0-8113-955ac28e61ef)

**Stay in your writing flow:**
- Type a tag, get a note - no popups, no decisions, no interruptions
- Your line content becomes the filename automatically
- The right template is applied based on which tag you use

**Smart and flexible:**
- Each tag can have its own template, folder, and filename pattern
- Support for nested/hierarchical tags (e.g., `#todo/urgent`)
- Only triggers on newly added tags - edit freely without duplicates
- Ignores tags in code blocks, comments, and frontmatter

**Seamless integration:**
- Automatic backlinks to track where notes came from
- Works across multiple files without issues
- Handles line edits and deletions gracefully

## How It Works

**The typical workflow without this plugin:**
1. Write a line: "Buy groceries"
2. Create a wiki link: `[[Buy groceries]]`
3. Click the link to open the new note
4. Choose a template from your template picker
5. Apply the template
6. Go back to your original note

**With Tag Templater:**
1. Write: "Buy groceries #todo"
2. *That's it.* The note is created with your todo template automatically.

**Behind the scenes:**
- You configure tags once (e.g., `#todo` → Todo template)
- When you type the tag, the plugin creates the note instantly
- The filename comes from your line content ("Buy groceries - Todo.md")
- A backlink to your current note is added automatically
- Your cursor stays right where you are - no context switching

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

## Getting Started

### Setting Up Your First Tag

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

**Now just write naturally:**
```
Buy groceries #todo
```

**What happens:**
- Note created instantly at `Tasks/Buy groceries - Todo.md`
- Your todo template is applied
- Backlink to your current note is added
- Your cursor stays right where it is - keep writing!

**The created note contains:**
```markdown
Created from: [[Original Note]]

## Task Details

Status: [ ] To Do

---

## Notes

```

### Nested Tags for Different Contexts

Use hierarchical tags when you need different templates for different types:

- `#todo` → Regular todo template
- `#todo/urgent` → Urgent todo template with priority fields
- `#meeting` → Meeting notes template
- `#meeting/1on1` → One-on-one meeting template with specific sections

Each tag configuration is matched exactly, so you can have as much specificity as you need.

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

**Nothing happens when I add a tag:**
- Make sure the tag is enabled in settings
- Check that your template file exists at the path you specified
- Tags in frontmatter, code blocks, or comments are ignored (by design)
- The tag name should be entered without the `#` in settings

**"Template not found" notification:**
- Double-check the template path in settings
- Use forward slashes: `Templates/Todo.md` not `Templates\Todo.md`
- The template validation in settings will show green when the path is correct

**The plugin keeps creating multiple notes:**
- This shouldn't happen - if it does, it's a bug! Please report it
- The plugin tracks what's been processed and won't create duplicates
- You can safely edit lines with tags - they won't trigger again unless the content changes significantly

## Frequently Asked Questions

### Will this slow down my typing or Obsidian?
No. The plugin waits 500ms after you stop typing before doing anything, and the processing is nearly instant. You won't notice any performance impact.

### What if I want to write about a tag without creating a note?
Just put it in a code block (`` `#todo` ``), comment (`%% #todo %%`), or frontmatter. The plugin ignores tags in these contexts.

### Can I edit a line after creating a note?
Absolutely. Edit freely - the plugin won't create duplicates. It only triggers when you add a *new* tag or when the content changes significantly (like deleting and rewriting).

### What happens if I delete a line and reuse the same line number?
The plugin is smart enough to detect content changes. If you delete a line and write something new on the same line number, it will work correctly.

### Can different tags use the same template?
Yes! You might want `#task`, `#todo`, and `#action` to all use the same task template but save to different folders.

### How do I organize where notes get created?
Each tag can have its own output folder. You can also set a default folder in settings that's used when a tag doesn't specify one.

### What if a note with that name already exists?
The plugin automatically adds a number: "Note.md" → "Note 1.md" → "Note 2.md". You'll never accidentally overwrite an existing note.

### Can I turn off the success notifications?
Yes, just toggle "Enable notifications" off in settings. Errors will still be shown (you probably want to know about those!).

## Support

If you encounter any issues or have feature requests, please file an issue on the GitHub repository.

## License

MIT
