# Tangerine Editor

If you need to clean up markup from editor so you can manually edit it, install `reaplace with `npm install -g replace` and then clean it up with the following command.

```
replace '&apos;' "'" . -r && replace '&lt;' '<' . -r && replace '&amp;' '&' . -r && replace '&gt;' '>' . -r && replace '&quot;' '"' . -r
```


