# StuffMe

**StuffMe** is a convenient tool to present your stuff.

Basically, it turns a folder full of markdown files into a slide deck ready to use and handle all the mess around it.


## Install

### With NPM

The easiest way to install **StuffMe** is to use `npm`

```bash
$ npm i https://github.com/JeremiePat/stuffme.git -g
```

### With Docker

_TBD_

## Usage

Once installed you'll get access to a cli command: `stuff` to create your presentations.

The source of any presentation is a folder containing markdown files.

### Creating a presentation

```bash
$ stuff make my/folder --format html/slides --output my/folder/slidedeck.html
```

the previous command will get all the markdown files out of the `my/folder` repository and will turn them into an HTML slide deck in the file `my/folder/slidedeck.html`.

The `--output` option isn't required and if it's omitted, the default name will be the name of the folder with the appropriate extension. For example, `stuff make my/folder` will create an HTML slide deck in the file `my/folder/folder.html`

The `--format` option indicates the output format. For example:

```bash
$ stuff make my/folder --format pdf/slides
```

This will produce a PDF document where each page will be one slide.

We currently support only two format: `html/slides` and `pdf/slides` but there are more to come.

### Serving a presentation

As a convenient tool, HTML slide decks can be served locally in order to display them nicely into your browser.

```bash
$ stuff serve my/folder --port=8000
```

This command will first create an HTML slide deck out of the markdown files available in `my/folder` and then launch a local web server accessible at the address: `http://localhost:8000`

## CLI API

### `stuff make`

```bash
stuff make [folder] [...options]
```

Where:
 - `[folder]` is the path to the source folder containing markdown files
   (default to current directory).
 - `[...options]` any of the options listed bellow

| Options  | Value |
|:---------|:------|
| --format, -f | The expected output format. Default to `pdf/slides` |
| --output, -o | An explicite path to the expected output file. Default to `<sourceFolder>/<folderName>.<formatExtension>` |
| --theme, -t | An explicite path to a custom theme folder. Default to `<sourceFolder>/theme` |
| --pack, -p | Put the output file (and its dependencies) into a compressed archive. Default to `zip` |

Currently supported output format:
 - `html/slides` Slide deck in HTML using [reveal.js](https://revealjs.com)
 - `pdf/slides` Slide deck in PDF format

Currently supported compression format
 - `zip` Produce a ZIP file
 - `tar` Produce a TAR file (compressed with GZip)

### `stuff serve`

```bash
stuff serve [folder] [...options]
```

Where:
 - `[folder]` is the path to the source folder containing markdown files
   (default to current directory).
 - `[...options]` any of the options listed bellow

| Options | Value |
|:--------|:------|
| --port, -p  | The port on where to serve the slide deck on the local machine. By default a random available port on the machine will be assigned |
| --theme, -t | An explicite path to a custom theme folder. Default to `<sourceFolder>/theme` |
| --browser, -b | Open your browser automatically |

## Customization

Presentations can be customized to fit your needs. To do that you can create a `theme` folder that will contain a YAML configuration file and some CSS files.

By default, the `theme` folder is expected to be within your main folder alongside your markdown files. However, you can use an external theme folder by using the `--theme` option:

```bash
$ stuff make --theme=/my/theme/folder
```

> **NOTE:** _When the `--theme` option is used, any theme folder within the content folder will be ignored._

### Configuration

Your them can contain a YAML configuration file to customize many aspect of the presentation. See [`theme/config.yaml`](theme/config.yaml) for the whole list of options and the exact syntaxe.

This include all the [reveal.js options](https://github.com/hakimel/reveal.js#configuration), the size of the document, the theme to apply, etc.

The `theme/config.yaml` represents the default config apply to all presentation. Your own config file can be lighter as it will overwrite only what you set.

#### Metadata

Beyond theme configuration, there are a few presentation metadata that can be specified outside the theme folder. Any YAML file within the same folder of the markdown file will always override the following metadata:

- `title` The title of the presentation
- `description` The description of the presentation
- `date` The date of creation/update of the presentation
- `lang` The language of the presentation
- `authors` The list of authors who contributed to the presentation (If there is only one author, it doesn't have to be a list)

It's a convenient way for users to set those data while using a third party theme.

> **NOTE:** _Theme creators are discourage to set those metadata within their configuration file, whilst users are encourage to create a `metadata.yml` file alongside their markdown files._

### Styling

You can create your own style for your presentations by simply adding css stylesheets at the root of the `theme` folder.

Any stylesheet within a subfolder won't be loaded, except is you import them within any of the top level stylesheet with the `@import` rule. However, if you want to split your CSS into multiple files we encourage you to prefer using Sass (see below).

For the PDF output, you can use the `@media print` rule to define a specific style for the PDF different than for the HTML:

```scss
/* This will apply to both HTML and PDF output */
body { font-family: sans-serif; }

/* This will apply to the HTML output (unless you try to print it) */
@media screen {
  body { font-size: 1rem; }
}

/* This will apply to the PDF output */
@media print {
  body { font-size: 12pt; }
}
```

> **NOTE:** _If you are creating relative links to ressources into your stylesheets, all those ressources must be into the theme folder. If you are creating absolute links, always assume that your root folder is your source folder containing your theme folder named `theme`, even if you specified your theme folder through the `--theme` option._

#### Using Sass

You can create your stylesheets using [Sass](https://sass-lang.com/). If so, **StuffMe** will compile your files automatically for you.

> **NOTE:** _To be able to compile, Sass needs to be a dependency of the theme installed. Even if we strongly advise to use the [sass](https://www.npmjs.com/package/sass) module to benefit from the latest Sass features, we also support the [node-sass](https://www.npmjs.com/package/node-sass) module._

The main benefit is if you want to create [a custom reveal.js theme](https://github.com/hakimel/reveal.js/blob/master/css/theme/README.md), as the reveal.js `css/theme/template` folder is a predefined include path:

```scss
@import "mixins";
@import "settings";

$mainFont: sans-serif;
$mainColor: #000;
$headingFont: Impact, sans-serif;
$headingColor: #900;
$backgroundColor: #EFEFEF;

// ...
// See: https://github.com/hakimel/reveal.js/blob/master/css/theme/template/settings.scss

@import "theme";
```

> **NOTE:** _If you create such a theme, remember to set the `theme` config entry to `null`_

It is important to acknowledge that the resulting CSS file will be created within you theme directory with the extension `.css`. It will override any preexisting file, so **be carful if you mix Sass and CSS files** at the root of your theme folder.
