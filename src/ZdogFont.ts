import * as Typr from "typr.js";

const TEXT_NEWLINE_REGEXP = /\r?\n/;

export function registerFontClass(Zdog: any) {
  // Zdog.Font class
  class ZdogFont {
    src: any;
    font: any;
    _hasLoaded: boolean;
    _loadCallbacks: any[];

    constructor(props: any) {
      console.log(Typr);
      console.log(Typr.parse);
      // Set missing props to default values
      props = Zdog.extend(
        {
          src: "",
        },
        props
      );
      this.src = props.src;
      this.font = null;
      this._hasLoaded = false;
      this._loadCallbacks = [];
      // Add this font instance to the internal font list
      Zdog.FontList.push(this);
      // Begin loading font file
      this._fetchFontResource(this.src)
        .then((buffer) => {
          const font = Typr.parse(buffer);
          // check font fields to see if the font was parsed correctly
          if (!font.head || !font.hmtx || !font.hhea || !font.glyf) {
            // get a list of missing font fields (only checks for ones that zfont uses)
            const missingFields = ["head", "hmtx", "hhea", "glyf"].filter(
              (field) => !font[field]
            );
            throw new Error(
              `Typr.js could not parse this font (unable to find ${missingFields.join(
                ", "
              )})`
            );
          }
          return font;
        })
        .then((font) => {
          this.font = font;
          this._hasLoaded = true;
          this._loadCallbacks.forEach((callback) => callback());
        })
        .catch((err) => {
          throw new Error(`Unable to load font from ${this.src}:\n${err}`);
        });
    }

    waitForLoad() {
      return new Promise((resolve, reject) => {
        // If the font is loaded, we can resolve right away
        if (this._hasLoaded && this._hasLoaded) {
          resolve(true);
        }
        // Otherwise, wait for it to load
        else {
          this._loadCallbacks.push(resolve);
        }
      });
    }

    getFontScale(fontSize: any) {
      if (!this._hasLoaded) {
        return null;
      } else {
        return (1 / this.font.head.unitsPerEm) * fontSize;
      }
    }

    measureText(text: string, fontSize = 64) {
      if (!this._hasLoaded) {
        return null;
      }
      const lines = Array.isArray(text)
        ? text
        : text.split(TEXT_NEWLINE_REGEXP);
      const font = this.font;
      const advanceWidthTable = font.hmtx.aWidth;
      const fontScale = this.getFontScale(fontSize) as number;
      const descender = font.hhea.descender;
      const ascender = font.hhea.ascender;
      const lineGap = font.hhea.lineGap;
      const lineWidths = lines.map((line: any) => {
        const glyphs = Typr.U.stringToGlyphs(this.font, line);
        return glyphs.reduce((advanceWidth: any, glyphId: number) => {
          // stringToGlyphs returns an array on glyph IDs that is the same length as the text string
          // an ID can sometimes be -1 in cases where multiple characters are merged into a single ligature
          if (glyphId > -1 && glyphId < advanceWidthTable.length) {
            advanceWidth += advanceWidthTable[glyphId];
          }
          return advanceWidth;
        }, 0);
      });
      const width = Math.max(...lineWidths);
      const lineHeight = 0 - descender + ascender;
      const height = lineHeight * lines.length;

      // Multiply by fontScale to convert from font units to pixels
      return {
        width: width * fontScale,
        height: height * fontScale,
        lineHeight: lineHeight * fontScale,
        lineWidths: lineWidths.map((width: number) => width * fontScale),
        descender: descender * fontScale,
        ascender: ascender * fontScale,
      };
    }

    getTextPath(
      text: string,
      fontSize = 64,
      x = 0,
      y = 0,
      z = 0,
      alignX = "left",
      alignY = "bottom"
    ) {
      if (!this._hasLoaded) {
        return [];
      }
      const lines = Array.isArray(text)
        ? text
        : text.split(TEXT_NEWLINE_REGEXP);
      const measurements = this.measureText(text, fontSize);
      const lineWidths = measurements!.lineWidths;
      const lineHeight = measurements!.lineHeight;
      return lines
        .map((line: any, lineIndex: string | number) => {
          const [_x, _y, _z] = this.getTextOrigin(
            {
              ...measurements!,
              width: lineWidths[lineIndex as number],
            },
            x,
            y,
            z,
            alignX,
            alignY
          );
          y += lineHeight;
          const glyphs = Typr.U.stringToGlyphs(this.font, line);
          const path = Typr.U.glyphsToPath(this.font, glyphs, null);
          return this._convertPathCommands(path, fontSize, _x, _y, z);
        })
        .flat();
    }

    getTextGlyphs(
      text: string,
      fontSize = 64,
      x = 0,
      y = 0,
      z = 0,
      alignX = "left",
      alignY = "bottom"
    ) {
      if (!this._hasLoaded) {
        return [];
      }
      const measurements = this.measureText(text, fontSize);
      const advanceWidthTable = this.font.hmtx.aWidth;
      const fontScale = this.getFontScale(fontSize);
      const lineWidths = measurements!.lineWidths;
      const lineHeight = measurements!.lineHeight;
      const lines = Array.isArray(text)
        ? text
        : text.split(TEXT_NEWLINE_REGEXP);
      return lines
        .map((line: any, lineIndex: string | number) => {
          const glyphs = Typr.U.stringToGlyphs(this.font, line);
          let [_x, _y, _z] = this.getTextOrigin(
            {
              ...measurements!,
              width: lineWidths[lineIndex as number],
            },
            x,
            y,
            z,
            alignX,
            alignY
          );
          y += lineHeight;
          return glyphs
            .filter((glyph: number) => glyph !== -1)
            .map((glyphId: string | number) => {
              const path = Typr.U.glyphsToPath(this.font, glyphId);
              const shape = {
                translate: { x: _x, y: _y, z: _z },
                path: this._convertPathCommands(path, fontSize, 0, 0, 0),
              };
              _x += advanceWidthTable[glyphId] * fontScale!;
              return shape;
            });
        })
        .flat();
    }

    getTextOrigin(
      measuement: {
        width: any;
        height: any;
        lineHeight: any;
        lineWidths?: any;
        descender?: any;
        ascender?: any;
      },
      x = 0,
      y = 0,
      z = 0,
      alignX = "left",
      alignY = "bottom"
    ) {
      let { width, height, lineHeight } = measuement;
      switch (alignX) {
        case "right":
          x -= width;
          break;
        case "center":
          x -= width / 2;
          break;
        default:
          break;
      }
      switch (alignY) {
        case "middle":
          y -= height / 2 - lineHeight;
          break;
        case "bottom":
        default:
          y -= height - lineHeight;
          break;
      }
      return [x, y, z];
    }

    // Convert Typr.js path commands to Zdog commands
    // Also apply font size scaling and coordinate adjustment
    // https://github.com/photopea/Typr.js
    // https://zzz.dog/shapes#shape-path-commands
    _convertPathCommands(
      path: { cmds: any; crds: any[] },
      fontSize: number,
      x = 0,
      y = 0,
      z = 0
    ) {
      const yDir = -1;
      const xDir = 1;
      const fontScale = this.getFontScale(fontSize);
      const commands = path.cmds;
      // Apply font scale to all coords
      const coords = path.crds.map((coord: number) => coord * fontScale!);
      // Convert coords to Zdog commands
      let startCoord: { x: number; y: number; z: number } | null = null;
      let coordOffset = 0;
      return commands
        .map((cmd: any) => {
          let result = null;
          if (!startCoord) {
            startCoord = {
              x: x + coords[coordOffset] * xDir,
              y: y + coords[coordOffset + 1] * yDir,
              z,
            };
          }
          switch (cmd) {
            case "M": // moveTo command
              result = {
                move: {
                  x: x + coords[coordOffset] * xDir,
                  y: y + coords[coordOffset + 1] * yDir,
                  z,
                },
              };
              coordOffset += 2;
              return result;
            case "L": // lineTo command
              result = {
                line: {
                  x: x + coords[coordOffset] * xDir,
                  y: y + coords[coordOffset + 1] * yDir,
                  z,
                },
              };
              coordOffset += 2;
              return result;
            case "C": // curveTo command
              result = {
                bezier: [
                  {
                    x: x + coords[coordOffset] * xDir,
                    y: y + coords[coordOffset + 1] * yDir,
                    z,
                  },
                  {
                    x: x + coords[coordOffset + 2] * xDir,
                    y: y + coords[coordOffset + 3] * yDir,
                    z,
                  },
                  {
                    x: x + coords[coordOffset + 4] * xDir,
                    y: y + coords[coordOffset + 5] * yDir,
                    z,
                  },
                ],
              };
              coordOffset += 6;
              return result;
            case "Q": // arcTo command
              result = {
                arc: [
                  {
                    x: x + coords[coordOffset] * xDir,
                    y: y + coords[coordOffset + 1] * yDir,
                    z,
                  },
                  {
                    x: x + coords[coordOffset + 2] * xDir,
                    y: y + coords[coordOffset + 3] * yDir,
                    z,
                  },
                ],
              };
              coordOffset += 4;
              return result;
            case "Z": // close path
              if (startCoord) {
                result = {
                  line: startCoord,
                };
                startCoord = null;
              }
              return result;
            // unhandled type
            // currently, #rrggbb and X types (used in multicolor fonts) aren't supported
            default:
              return result;
          }
        })
        .filter((cmd: null) => cmd !== null); // filter out null commands
    }

    _fetchFontResource(source: any) {
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        // Fetch as an arrayBuffer for Typr.parse
        request.responseType = "arraybuffer";
        request.open("GET", source, true);
        request.onreadystatechange = (e: any) => {
          if (request.readyState === 4) {
            if (request.status >= 200 && request.status < 300) {
              resolve(request.response);
            } else {
              reject(`HTTP error ${request.status}: ${request.statusText}`);
            }
          }
        };
        request.send(null);
      });
    }
  }

  Zdog.Font = ZdogFont;
  return Zdog;
}
