<template>
  <n-space
    :wrap-item="false"
    justify="center"
    style="background-color: #b3f2df"
  >
    <div v-if="!isLoading" class="max-w-xl" style="width: 36rem">
      <Login class="mb-4" />
      <VoteForm
        v-if="user"
        :votes="votes2"
        description=""
        title="🌍"
        post-id="video"
        class="mb-4"
      />
      <VoteForm
        v-if="user"
        :votes="votes1"
        description=""
        title="🎸"
        post-id="talent"
      />
    </div>
    <div v-else>
      <n-spin size="large" />
    </div>
  </n-space>
</template>

<script>
import { Auth } from "aws-amplify";
import { useVoteStore } from "@/store/vote";
import { mapState } from "pinia";

export default {
  data() {
    return {
      isLoading: true,
      votes1: [
        {
          value: "",
          label: "",
          description: "",
          imageUrl: "/img/<YOUR_IMAGE_URL>",
        },
      ],
      votes2: [],
    };
  },
  computed: {
    ...mapState(useVoteStore, ["user"]),
  },
  mounted() {
    this.currentAuthenticatedUser();
  },
  methods: {
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
