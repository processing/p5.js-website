# 🌍 Community Feedback Needed: Translation Tracker Issue Template

Hi p5.js community! 👋

I'm working on a **GSoC 2024 project** to create an automated translation tracker for the p5.js website. As part of **Week 2**, I'm implementing a system that automatically creates GitHub issues when translations become outdated.

## 🎯 What I'm Building

The translation tracker will:
1. **Monitor changes** to English example/tutorial files
2. **Detect outdated translations** using GitHub API commit comparison
3. **Automatically create issues** to alert translators about needed updates
4. **Focus on Hindi first**, then expand to other languages

## 📋 Issue Template Draft

Here's the current issue template format that would be automatically generated:

---

### 🌍 Update HI translation for description.mdx

## 🌍 Translation Update Needed

**File**: `src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx`
**Language**: Hindi (हिन्दी)
**Translation file**: `src/content/examples/hi/01_Shapes_And_Color/00_Shape_Primitives/description.mdx`

### 📅 Timeline
- **English last updated**: 6/10/2024 by p5js-contributor
- **Translation last updated**: 6/1/2024 by hindi-translator

### 🔗 Quick Links
- [📄 Current English file](https://github.com/processing/p5.js-website/blob/main/src/content/examples/en/01_Shapes_And_Color/00_Shape_Primitives/description.mdx)
- [📝 Translation file](https://github.com/processing/p5.js-website/blob/main/src/content/examples/hi/01_Shapes_And_Color/00_Shape_Primitives/description.mdx)
- [🔍 Compare changes](https://github.com/processing/p5.js-website/compare/def0987...abc1234)

### 📋 What to do
1. Review the English changes in the file
2. Update the Hindi (हिन्दी) translation accordingly
3. Maintain the same structure and formatting
4. Test the translation for accuracy and cultural appropriateness

### 📝 Recent English Changes
**Last commit**: [Update shape primitives documentation with better examples](https://github.com/processing/p5.js-website/commit/abc1234567890)

---
*This issue was automatically created by the p5.js Translation Tracker 🤖*
*Need help? Check our [translation guidelines](https://github.com/processing/p5.js-website/blob/main/contributor_docs/translation.md)*

---

## 🤔 Questions for the Community

1. **Is this issue format helpful and clear?** What would you add/remove?

2. **Should the issue title be bilingual?** 
   - Current: "🌍 Update HI translation for description.mdx"
   - Alternative: "🌍 हिन्दी अनुवाद अपडेट / Update HI translation for description.mdx"

3. **What labels should be automatically applied?**
   - Current: `translation`, `lang-hi`, `help wanted`
   - Suggestions for others?

4. **Should we include diff information?** 
   - Show specific lines that changed (if easily obtainable)?
   - Or is the "Compare changes" link sufficient?

5. **Frequency concerns:**
   - Should there be a cooldown period to avoid spamming issues?
   - Batch multiple files into one issue?

6. **Translation workflow preferences:**
   - Should we assign issues to known translators automatically?
   - Create issues in specific projects/milestones?

## 🚀 Timeline

- **Week 1**: ✅ Basic detection logic
- **Week 2**: 🔄 Issue creation (current)
- **Week 3**: Enhanced issue management
- **Week 4**: Multi-language support expansion

## 🙏 How to Help

Please share your thoughts on:
- Issue template format and content
- Translation workflow improvements
- Any missing information that would help translators
- Concerns about automation frequency

Your feedback will directly shape how this tool works for the p5.js translation community!

Thanks! 🎨

---
*@Divyansh013 | GSoC 2024 - p5.js Website Translation Automation* 