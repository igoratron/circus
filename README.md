# Circus
Circus is a styleguide generator which processes YAML formatted comments in your SCSS and CSS files and outputs HTML.

## Introduction
Although, in many ways this project is very similar to [kss-node](https://github.com/kss-node/kss-node), it takes the "configuration over convention" approach to make the behaviour more explicit. Circus extracts YAML formatted comments from your source files, converts them into JSON objects and passes them into the Handlebars compiler to make the values available inside the templates. For example, given the following CSS file:
``` css
/**
 * section: components/buttons
 * title: Buttons
 *
 * description: |
 *   To create a button, simply add the following button classes to a `button`, `a`, or `input` element.
 *   Each button should have the `btn` class to start with, followed by the available button classes to create the desired button styling.
 *
 * modifiers:
 *   btn--primary: Primary button
 *   is-loading: Button with loading indicator
 *
 * markup: sass/components/buttons/buttons
 */

.btn {
}

.btn--primary {
}
```
the following JSON object would be available to the template
``` javascript
{
  "section": "components/buttons",
  "title": "Buttons",
  "description": "To create a button, simply add the following button classes to a `button`, `a`, or `input` element.\nEach button should have the `btn` class to start with, followed by the available button classes to create the desired button styling.\n",
  "modifiers": {
    "btn--primary": "Primary button",
    "is-loading": "Button with loading indicator"
  },
  "markup": "sass/components/buttons/buttons"
}
```
## Usage
Currently, circus can only be used as a gulp plugin
``` javascript
  const circus = require('circus').default;

  gulp.src('src/sass/**/*.scss'))
    .pipe(buffer())
    .pipe(circus({
       templates: {
         homepage: path.join(opts.styleguideSource, '/templates/homepage.hbs'),
         tableOfContents: path.join(opts.styleguideSource, '/templates/tableOfContents.hbs'),
         leaf: path.join(opts.styleguideSource, '/templates/leaf.hbs'),
         partials: [
           path.join(opts.styleguideSource, '/templates/partials/**/*.hbs'),
           path.join('src/sass', '/**/*.hbs'),
           path.join('src/fonts', '/**/*.hbs'),
         ]
       },
       groupBy: block => block.section.replace(/\//g, '/children/').split('/')
    }))
    .pipe('dist/');
```

## Partials and Helpers

### Sidebar
Display the sidebar. Example of usage:

#### Helper
The sidebar requires a helper so it can set the context in order to generate it. Also, it needs to build the sidebar recursively, so it requires a separate partial. Pass `level="0"` to add initial depth to the sidebar tree structure. Example:

``` html
{{#sidebar}}
  {{> sidebar level="0"}}
{{/sidebar}}
```
#### Partial
Example of the recursive partial (`{{> sidebar}}`) for the sidebar

``` html
<ul class="sidebar-nav {{#if level}}sidebar-nav--level-{{level}}{{/if}}">
  {{#each this as |item|}}
    {{#if item}}
      <li>
        <a href="/{{item.section}}">{{item.title}}</a>
        {{#if item.children}}
          {{> sidebar item.children level=item.depth}}
        {{/if}}
      </li>
    {{/if}}
  {{/each}}
</ul>
```
