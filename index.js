import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';
import fs from 'fs'

// sd-transforms, 2nd parameter for options can be added
// See docs: https://github.com/tokens-studio/sd-transforms
register(StyleDictionary, {
  // expand: {
  //   composition: true,
  //   typography: true,
  //   border: false,
  //   shadow: false,
  //   color: true,
  // },
  excludeParentKeys: false,
});

const transformValue = (value, tokens) => {
  if (value.includes('{')) {
    const newLinkToVar = value.replace('{','').replace('}','').split('.').join('-');
    const foundToken = tokens.find((v) => v.name.includes(newLinkToVar));
    if (foundToken) {
      return `$${foundToken.path.join('-').toLowerCase().replaceAll('/', '-')}`;
    }
    return value;
  } else {
    return value;
  }
}
const formatProperty = (token, tokens) => {
  const { path, value } = token;
  return `$${path.join('-').toLowerCase().replaceAll('/', '-')}: ${transformValue(value,tokens)};`;
};

StyleDictionary.registerFormat({
  name: 'scss/custom',
  format: function ({ dictionary, options }) {
    // console.log(dictionary.allTokens);
    // fs.writeFileSync('./test.json', JSON.stringify(dictionary));
    // fs.writeFileSync('./options.json', JSON.stringify(options));
    return dictionary.allTokens.map((v) => formatProperty(v, dictionary.allTokens)).join('\n');
  },
});

const sd = new StyleDictionary({
  source: ['tokens/tokens.json'],
  preprocessors: ['tokens-studio'],
  platforms: {
    scss: {
      buildPath: 'build/scss/',
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      files: [
        {
          destination: '_variables.scss',
          format: 'scss/custom',
        },
      ],
      options: {
        "outputReferences": true
      }
    },
  },
  log: {
    warnings: 'warn', // 'warn' | 'error' | 'disabled'
    verbosity: 'verbose', // 'default' | 'silent' | 'verbose'
    errors: {
      brokenReferences: 'console', // 'throw' | 'console'
    },
  },
});
// optionally, cleanup files first..
await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();