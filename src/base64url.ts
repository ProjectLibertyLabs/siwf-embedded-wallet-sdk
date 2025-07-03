/* eslint-disable */
/**
 * Avoid modifying this file. It's part of
 * https://github.com/supabase-community/base64url-js.  Submit all fixes on
 * that repo!
 */

/**
 * An array of characters that encode 6 bits into a Base64-URL alphabet
 * character.
 */
const TO_BASE64URL =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");

/**
 * Converts a byte to a Base64-URL string.
 *
 * @param byte The byte to convert, or null to flush at the end of the byte sequence.
 * @param state The Base64 conversion state. Pass an initial value of `{ queue: 0, queuedBits: 0 }`.
 * @param emit A function called with the next Base64 character when ready.
 */
export function byteToBase64URL(
  byte: number | null,
  state: { queue: number; queuedBits: number },
  emit: (char: string) => void,
) {
  if (byte !== null) {
    state.queue = (state.queue << 8) | byte;
    state.queuedBits += 8;

    while (state.queuedBits >= 6) {
      const pos = (state.queue >> (state.queuedBits - 6)) & 63;
      emit(TO_BASE64URL[pos]!);
      state.queuedBits -= 6;
    }
  } else if (state.queuedBits > 0) {
    state.queue = state.queue << (6 - state.queuedBits);
    state.queuedBits = 6;

    while (state.queuedBits >= 6) {
      const pos = (state.queue >> (state.queuedBits - 6)) & 63;
      emit(TO_BASE64URL[pos]!);
      state.queuedBits -= 6;
    }
  }
}

/**
 * Converts a JavaScript string (which may include any valid character) into a
 * Base64-URL encoded string. The string is first encoded in UTF-8 which is
 * then encoded as Base64-URL.
 *
 * @param str The string to convert.
 */
export function stringToBase64URL(str: string) {
  const base64: string[] = [];

  const emitter = (char: string) => {
    base64.push(char);
  };

  const state = { queue: 0, queuedBits: 0 };

  stringToUTF8(str, (byte: number) => {
    byteToBase64URL(byte, state, emitter);
  });

  byteToBase64URL(null, state, emitter);

  return base64.join("");
}

/**
 * Converts a Unicode codepoint to a multi-byte UTF-8 sequence.
 *
 * @param codepoint The Unicode codepoint.
 * @param emit      Function which will be called for each UTF-8 byte that represents the codepoint.
 */
export function codepointToUTF8(
  codepoint: number,
  emit: (byte: number) => void,
) {
  if (codepoint <= 0x7f) {
    emit(codepoint);
    return;
  } else if (codepoint <= 0x7ff) {
    emit(0xc0 | (codepoint >> 6));
    emit(0x80 | (codepoint & 0x3f));
    return;
  } else if (codepoint <= 0xffff) {
    emit(0xe0 | (codepoint >> 12));
    emit(0x80 | ((codepoint >> 6) & 0x3f));
    emit(0x80 | (codepoint & 0x3f));
    return;
  } else if (codepoint <= 0x10ffff) {
    emit(0xf0 | (codepoint >> 18));
    emit(0x80 | ((codepoint >> 12) & 0x3f));
    emit(0x80 | ((codepoint >> 6) & 0x3f));
    emit(0x80 | (codepoint & 0x3f));
    return;
  }

  throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
}

/**
 * Converts a JavaScript string to a sequence of UTF-8 bytes.
 *
 * @param str  The string to convert to UTF-8.
 * @param emit Function which will be called for each UTF-8 byte of the string.
 */
export function stringToUTF8(str: string, emit: (byte: number) => void) {
  for (let i = 0; i < str.length; i += 1) {
    let codepoint = str.charCodeAt(i);

    if (codepoint > 0xd7ff && codepoint <= 0xdbff) {
      // most UTF-16 codepoints are Unicode codepoints, except values in this
      // range where the next UTF-16 codepoint needs to be combined with the
      // current one to get the Unicode codepoint
      const highSurrogate = ((codepoint - 0xd800) * 0x400) & 0xffff;
      const lowSurrogate = (str.charCodeAt(i + 1) - 0xdc00) & 0xffff;
      codepoint = (lowSurrogate | highSurrogate) + 0x10000;
      i += 1;
    }

    codepointToUTF8(codepoint, emit);
  }
}
