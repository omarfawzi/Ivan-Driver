build-android-bundle:
	cd android && ./gradlew clean && ./gradlew bundleRelease
build-android-apk:
	cd android && ./gradlew assembleRelease
run-release:
	npx react-native run-android --variant=release