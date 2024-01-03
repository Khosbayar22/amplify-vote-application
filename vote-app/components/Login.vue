<template>
  <n-card>
    <div v-if="user">
      <n-space justify="center" align="center" class="mb-4">
        <n-avatar
          class="cursor-pointer"
          round
          size="medium"
          src="/img/snowman.png"
        >
        </n-avatar>
        <div>Hi ! {{ user?.attributes?.email }}</div>
      </n-space>
      <n-space justify="center" align="center" :wrap-item="false">
        <n-button class="w-full" size="large" @click="signOut" ghost>
          Sign out
        </n-button>
        <n-button
          class="w-full"
          size="large"
          @click="
            $router.push({
              path: 'dashboard',
            })
          "
        >
          Total votes
        </n-button>
      </n-space>
    </div>
    <div v-else-if="!isLoading">
      <n-space class="mb-4" justify="center" align="center" vertical>
        <img src="/img/hc.png" class="w-80 rounded-2xl mb-4" />
        <n-p>
          🎊 Happy New Year! 🎉 <br />
          If you are a member of DDAM or DD, you can take part in the 2024 New
          Year competition by logging in with your account and casting your
          vote. Kindly ensure that your account is registered under DD and DDAM.
          <br /><br />
          - DDAM Rock Star
          <br />
          - Toward the Global (Limited members)
        </n-p>
      </n-space>
      <n-button
        @click="loginWithGoogle"
        :loading="isLoading || isClick"
        class="w-full"
        size="large"
      >
        Login with Google
      </n-button>
    </div>
  </n-card>
</template>

<script>
import { Auth } from "aws-amplify";
import { useVoteStore } from "@/store/vote";
import { mapState } from "pinia";

export default {
  computed: {
    ...mapState(useVoteStore, ["user"]),
  },
  data() {
    return {
      isLoading: false,
      isClick: false,
    };
  },
  methods: {
    async signOut() {
      await Auth.signOut().then(() => {
        useVoteStore().$patch({
          user: null,
        });
        this.$router.push("/");
      });
    },
    async loginWithGoogle() {
      await Auth.federatedSignIn({
        provider: "Google",
      }).then(async () => {
        await this.currentAuthenticatedUser();
      });
    },
    async currentAuthenticatedUser() {
      this.isLoading = true;
      await Auth.currentAuthenticatedUser({
        bypassCache: false,
      })
        .then((res) => {
          useVoteStore().$patch({
            user: res,
          });
          this.isLoading = false;
        })
        .catch(() => {
          this.isLoading = false;
        });
    },
  },
};
</script>
