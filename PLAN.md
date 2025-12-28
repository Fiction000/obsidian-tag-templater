# Overview
This is an obsidian plugin that enables note creation triggered by tags with templates applied. It makes creating notes seemless experiences without ever thinking about "what templates should I use for this?".

# Requirements
- Ability to create notes when the user applied a specified tag to a line in the note.
- Ability to configure which tag for the plugin to trigger and create a new file.
- Ability to specify which template to use for the file creation. This setting should be specific to each tags.
- Avoid trigger for any tags applied in metaadta field of Obsidian such as in property (after "tags:" or "tags::")
- Only apply for new tags added.
- File name should be the contents of the line without any characters not allowed for fileanme. There should also be a settings to specify the string to alwasy append to the fileanme for each tags.
