export default function removeLastChar(character) {
    if (character != null && character.length > 0) {
      return (character = character.substring(0, character.length - 1));
    }
}