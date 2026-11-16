# Models are read and written by kotlinx.serialization: keep their generated serializers.
-keepattributes *Annotation*, InnerClasses, Signature, Exceptions
-dontnote kotlinx.serialization.**
-keepclassmembers @kotlinx.serialization.Serializable class pk.examwise.** {
    *** Companion;
    *** INSTANCE;
    kotlinx.serialization.KSerializer serializer(...);
}
-keepclasseswithmembers class pk.examwise.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class pk.examwise.**$$serializer { *; }

# Ktor and OkHttp pull in optional classes that aren't on Android.
-dontwarn org.slf4j.**
-dontwarn io.ktor.**
-dontwarn okhttp3.internal.platform.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn java.lang.management.**

# SQLCipher's native code calls back into these.
-keep class net.zetetic.database.** { *; }

# No logging in release.
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
    public static int e(...);
}
