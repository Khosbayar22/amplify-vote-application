<template>
  <n-card :title="title">
    <n-result
      v-if="isShowSuccessModal"
      status="success"
      title="Success!"
      size="small"
      description="Thank you for your participation."
    >
      <template #icon>
        <img src="/img/flat.png" class="w-16" />
      </template>
    </n-result>
    <n-result
      v-else-if="isSubmitted"
      status="success"
      size="small"
      title="Submitted"
      description="Your response has been successfully submitted. Please note that once submitted, your poll cannot be edited."
    >
      <template #icon>
        <img src="/img/snowglobe.png" class="w-16" />
      </template>
    </n-result>
    <div v-else-if="!loading">
      <n-p>
        <n-ellipsis
          expand-trigger="click"
          line-clamp="3"
          :tooltip="false"
          v-html="description"
        >
        </n-ellipsis>
      </n-p>

      <n-radio-group v-model:value="model.selectedVote" name="radiogroup">
        <n-space vertical>
          <n-radio
            v-for="vote in votes"
            :key="vote.value"
            :value="vote.value"
            :label="vote.label"
          >
            <template #default>
              <n-space justify="center">
                <div v-if="showImage">
                  <n-avatar
                    class="cursor-pointer"
                    size="large"
                    :src="vote?.imageUrl"
                  >
                  </n-avatar>
                </div>
                <div>
                  <div class="font-semibold">{{ vote.label }}</div>
                  <n-p
                    v-if="vote?.description"
                    class="mt-0 pb-2 text-gray-500"
                    >{{ vote.description }}</n-p
                  >
                </div>
              </n-space>
            </template>
          </n-radio>
        </n-space>
      </n-radio-group>
      <n-space :wrap-item="false" class="mt-8" :size="8">
        <n-popconfirm @positive-click="submitForm">
          <template #trigger>
            <n-button
              :loading="loadingSubmit"
              class="w-full"
              size="large"
              type="info"
            >
              Submit
            </n-button>
          </template>
          Are you sure ?
        </n-popconfirm>
        <n-alert
          v-if="errorFill"
          :show-icon="false"
          type="error"
          class="w-full"
        >
          Field is required.
        </n-alert>
        <n-alert
          v-if="errorYouAreNot"
          :show-icon="false"
          type="error"
          class="w-full"
        >
          Only limited members are allowed to access this feature.
        </n-alert>
        <n-alert
          v-if="errorSubmit"
          :show-icon="false"
          type="error"
          class="w-full"
        >
          You have already submitted.
        </n-alert>
      </n-space>
    </div>
    <n-space justify="center" align="center" v-else>
      <n-spin size="large" />
    </n-space>
  </n-card>
</template>

<script>
import { useVoteStore } from "@/store/vote";
import { mapState } from "pinia";
import { API, Auth } from "aws-amplify";

export default {
  data() {
    return {
      model: {
        selectedVote: null,
      },
      isShowSuccessModal: false,
      loadingSubmit: false,
      isSubmitted: false,
      errorFill: false,
      errorYouAreNot: false,
      errorSubmit: false,
      loading: false,
    };
  },
  props: {
    votes: {
      type: Array,
      default: [],
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    postId: {
      type: String,
    },
    showImage: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {
    this.fetchVote();
  },
  computed: {
    ...mapState(useVoteStore, ["user"]),
  },
  methods: {
    async submitForm() {
      try {
        this.errorFill = false;
        this.errorYouAreNot = false;
        this.errorSubmit = false;
        this.loadingSubmit = true;
        if (!this.model.selectedVote) {
          this.errorFill = true;
          this.loadingSubmit = false;
          return;
        }
        const input = {
          postId: this.postId,
          userId: this.user?.attributes.sub,
          vote: this.model.selectedVote,
        };

        const protectVote = `
        mutation ProtectVote($userId: String!, $postId: String!, $vote: String!) {
          protectVote(userId: $userId, postId: $postId, vote: $vote)
        }
      `;

        const res = await API.graphql({
          query: protectVote,
          variables: input,
        });
        const data = JSON.parse(res.data.protectVote);

        if (data?.statusCode === 200) {
          const body = JSON.parse(data?.body);
          this.isShowSuccessModal = true;
          console.log(body);
        }
        if (data?.statusCode === 401) {
          this.errorSubmit = true;
        }
        if (data?.statusCode === 402) {
          this.errorYouAreNot = true;
        }

        this.loadingSubmit = false;
      } catch (error) {
        this.loadingSubmit = false;
      }
    },
    async fetchVote() {
      this.loading = true;
      const listVotes = `
        query ListVotes(
          $filter: ModelVoteFilterInput
          $limit: Int
          $nextToken: String
        ) {
          listVotes(filter: $filter, limit: $limit, nextToken: $nextToken) {
            items {
              id
              userId
              postId
              createdAt
              vote
            }
            nextToken
            __typename
          }
        }
      `;
      const filter = {
        postId: {
          eq: this.postId,
        },
        userId: {
          eq: this.user?.attributes.sub,
        },
      };
      try {
        const res = await API.graphql({
          query: listVotes,
          variables: {
            filter: filter,
          },
        });
        const totalVote = res?.data?.listVotes.items.length || 0;
        this.isSubmitted = totalVote > 0;

        this.loading = false;
      } catch (error) {
        this.loading = false;
      }
    },
  },
};
</script>
