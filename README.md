# aha-bem

Happy using BEM in the tag.

## Installation

`npm i vite-plugin-aha-bem`

## Usage

```ts
// vite.config.ts
import ahaBem from 'vite-plugin-aha-bem';
plugins[ahaBem()]
```

## Example Effect

```html
<!-- *.vue -->
<template>
  <div b:header>
    <div e:left>
      <div b:user m:light>
        <div e:user-top>
          <img e:avatar m:hover m:selected src="" alt="" />
        </div>
        <div e:user-bottom></div>
      </div>
    </div>
  </div>
</template>
```

parse after

```html
<!-- *.vue -->
<template>
  <div class="header " b:header>
    <div class=" header__left " e:left>
      <div class="user user--light " b:user m:light>
        <div class=" user__user-top " e:user-top>
          <img
            class=" user__avatar user__avatar--hover user__avatar--selected "
            e:avatar
            m:hover
            m:selected
            src=""
            alt=""
          />
        </div>
        <div class=" user__user-bottom " e:user-bottom></div>
      </div>
    </div>
  </div>
</template>
```
