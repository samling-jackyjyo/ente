import 'dart:convert';

class KeyAttributes {
  final String kekSalt;
  final String kekHash;
  final String encryptedKey;
  final String keyDecryptionNonce;
  final String publicKey;
  final String encryptedSecretKey;
  final String secretKeyDecryptionNonce;

  KeyAttributes(
    this.kekSalt,
    this.kekHash,
    this.encryptedKey,
    this.keyDecryptionNonce,
    this.publicKey,
    this.encryptedSecretKey,
    this.secretKeyDecryptionNonce,
  );

  KeyAttributes copyWith({
    String kekSalt,
    String kekHash,
    String encryptedKey,
    String keyDecryptionNonce,
    String publicKey,
    String encryptedSecretKey,
    String secretKeyDecryptionNonce,
  }) {
    return KeyAttributes(
      kekSalt ?? this.kekSalt,
      kekHash ?? this.kekHash,
      encryptedKey ?? this.encryptedKey,
      keyDecryptionNonce ?? this.keyDecryptionNonce,
      publicKey ?? this.publicKey,
      encryptedSecretKey ?? this.encryptedSecretKey,
      secretKeyDecryptionNonce ?? this.secretKeyDecryptionNonce,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'kekSalt': kekSalt,
      'kekHash': kekHash,
      'encryptedKey': encryptedKey,
      'keyDecryptionNonce': keyDecryptionNonce,
      'publicKey': publicKey,
      'encryptedSecretKey': encryptedSecretKey,
      'secretKeyDecryptionNonce': secretKeyDecryptionNonce,
    };
  }

  factory KeyAttributes.fromMap(Map<String, dynamic> map) {
    if (map == null) return null;

    return KeyAttributes(
      map['kekSalt'],
      map['kekHash'],
      map['encryptedKey'],
      map['keyDecryptionNonce'],
      map['publicKey'],
      map['encryptedSecretKey'],
      map['secretKeyDecryptionNonce'],
    );
  }

  String toJson() => json.encode(toMap());

  factory KeyAttributes.fromJson(String source) =>
      KeyAttributes.fromMap(json.decode(source));

  @override
  String toString() {
    return 'KeyAttributes(kekSalt: $kekSalt, kekHash: $kekHash, encryptedKey: $encryptedKey, keyDecryptionNonce: $keyDecryptionNonce, publicKey: $publicKey, encryptedSecretKey: $encryptedSecretKey, secretKeyDecryptionNonce: $secretKeyDecryptionNonce)';
  }

  @override
  bool operator ==(Object o) {
    if (identical(this, o)) return true;

    return o is KeyAttributes &&
        o.kekSalt == kekSalt &&
        o.kekHash == kekHash &&
        o.encryptedKey == encryptedKey &&
        o.keyDecryptionNonce == keyDecryptionNonce &&
        o.publicKey == publicKey &&
        o.encryptedSecretKey == encryptedSecretKey &&
        o.secretKeyDecryptionNonce == secretKeyDecryptionNonce;
  }

  @override
  int get hashCode {
    return kekSalt.hashCode ^
        kekHash.hashCode ^
        encryptedKey.hashCode ^
        keyDecryptionNonce.hashCode ^
        publicKey.hashCode ^
        encryptedSecretKey.hashCode ^
        secretKeyDecryptionNonce.hashCode;
  }
}
