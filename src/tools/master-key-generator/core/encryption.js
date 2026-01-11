import CryptoJS from 'crypto-js';

/**
 * Encrypts data using AES and then encodes the result to Base64 (though AES.toString() is already Base64-like, specific requirements might apply).
 * User request: "encrypt password then base64".
 * CryptoJS.AES.encrypt returns a CipherParams object. .toString() gives a Base64 encoded OpenSSL-compatible format.
 * We will assume the user simply wants the standard AES string representation.
 *
 * @param {string} data - The data to encrypt (e.g., password).
 * @param {string} key - The master key.
 * @returns {string} - The encrypted string.
 */
export const encryptPassword = (data, key) => {
	if (!data || !key) return '';
	try {
		const encrypted = CryptoJS.AES.encrypt(data, key).toString();
		// Use btoa to add an extra layer of Base64 if strictly requested,
		// but usually AES output is enough.
		// Let's do exactly what was asked: Encrypt -> Base64.
		// Since AES.toString() is already a Base64 string of the ciphertext structure,
		// we will encode THAT string to Base64 to be "doubly" sure/obfuscated as requested.
		return btoa(encrypted);
	} catch (error) {
		console.error('Encryption failed:', error);
		return '';
	}
};

/**
 * Decrypts the data.
 * Reverse of encryptPassword.
 *
 * @param {string} encryptedData - The encrypted data (Base64 of AES string).
 * @param {string} key - The master key.
 * @returns {string} - The decrypted original data.
 */
export const decryptPassword = (encryptedData, key) => {
	if (!encryptedData || !key) return '';
	try {
		const aesString = atob(encryptedData);
		const bytes = CryptoJS.AES.decrypt(aesString, key);
		return bytes.toString(CryptoJS.enc.Utf8);
	} catch (error) {
		// Suppress error logging for "Malformed UTF-8" which happens frequent during typing of master key
		// console.error("Decryption failed:", error);
		return '';
	}
};
