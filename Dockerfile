FROM node:18-alpine

# Install Java and Android SDK dependencies
RUN apk add --no-cache \
    openjdk11 \
    wget \
    unzip \
    git \
    build-base \
    python3

# Set Java home
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk
ENV PATH=$PATH:$JAVA_HOME/bin

# Install Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools

RUN mkdir -p $ANDROID_HOME && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip -q commandlinetools-linux-9477386_latest.zip -d $ANDROID_HOME && \
    rm commandlinetools-linux-9477386_latest.zip && \
    mv $ANDROID_HOME/cmdline-tools $ANDROID_HOME/cmdline-tools-latest && \
    mkdir -p $ANDROID_HOME/cmdline-tools/latest && \
    mv $ANDROID_HOME/cmdline-tools-latest/* $ANDROID_HOME/cmdline-tools/latest/

# Accept Android licenses
RUN yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses

# Install Android SDK components
RUN $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \
    "platforms;android-34" \
    "build-tools;34.0.0" \
    "ndk;26.1.10909125"

# Set working directory
WORKDIR /app

# Copy project
COPY . .

# Install dependencies
RUN npm install

# Run prebuild
RUN npx react-native-cli prebuild --clean --platform android

# Build APK
RUN cd android && ./gradlew assembleRelease && cd ..

# Output
CMD ["sh", "-c", "cp android/app/build/outputs/apk/release/app-release.apk /output/app-release.apk && echo 'APK built successfully!'"]
