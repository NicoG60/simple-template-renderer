# Simple template file renderer

![units-test](https://github.com/NicoG60/simple-template-renderer/workflows/units-test/badge.svg)

## TL;DR Usage

Let's say you have the following text file
```
Hello ${MY_NAME}!
```

You can use
```yaml
uses: NicoG60/simple-template-renderer@v1
with:
  input: my/**/file*.txt
  output: destination/directory
env:
  MY_NAME: 'John Doe'
```

in `destination/directory/file.txt` you'll get
```
Hello John Doe!
```

## Complete usage

```yaml
uses: NicoG60/simple-template-renderer@v1
with:
  input: my/**/file*.txt        # - Input file path, or glob. Required.   
  output: destination           # - Output directory. Optional.
                                #   Replacement done in place if not provided
  follow-symbolic-links: false  # - Pretty obvious right? Optional. Default: false
  hard-fail: false              # - When set to true, the workflow fails if it
                                #   can't find a corresponding variable in the env
                                #   Optional. Default: false
  enable-log: false             # - Whether to log the content of the files
```