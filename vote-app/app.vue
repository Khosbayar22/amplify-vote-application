<template>
  <NaiveConfig :theme-config="themeConfig">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </NaiveConfig>
</template>

<script>
export default {
  data() {
    return {
      themeConfig: {
        mobile: {
          defaults: false,
        },
        mobileOrTablet: {
          defaults: false,
        },
        shared: {
          common: {
            borderRadius: "10px",
          },
          Form: {
            feedbackHeightMedium: "12px",
          },
        },
        light: {
          common: {
            primaryColor: "#00C474",
            primaryColorHover: "#00C474",
            primaryColorPressed: "#00C474",
          },
        },
        dark: {
          common: {
            primaryColor: "#00C474",
            primaryColorHover: "#00C474",
            primaryColorPressed: "#00C474",
          },
        },
      },
    };
  },
  mounted() {
    const { colorModePreference } = useNaiveColorMode();

    colorModePreference.set("light");
  },
};
</script>
