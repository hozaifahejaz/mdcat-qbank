import org.jetbrains.kotlin.gradle.dsl.JvmTarget

// Everything here compiles without Android: models, the API client, the watermark and the offline lease rules.
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin { compilerOptions { jvmTarget.set(JvmTarget.JVM_17) } }

dependencies {
    api(libs.coroutines.core)
    api(libs.serialization.json)
    api(libs.ktor.client.core)
    implementation(libs.ktor.client.okhttp)
    testImplementation(libs.junit)
    testImplementation(libs.coroutines.test)
    testImplementation(libs.ktor.client.mock)
}
