<template>
  <n-space :wrap-item="false" justify="center">
    <div class="max-w-xl" style="width: 36rem">
      <n-card v-if="isLoading">
        <n-spin></n-spin>
      </n-card>
      <div v-else>
        <n-card title="Total votes" class="mb-4">
          <n-collapse class="mb-4">
            <n-collapse-item title="🌍" name="1">
              <n-data-table
                :columns="[{ title: 'Voter', key: 'email' }]"
                :data="
                  videoVoters.map((item) => {
                    return {
                      email: item?.email,
                    };
                  })
                "
                :pagination="{ pageSize: 10 }"
                :bordered="false"
              />
            </n-collapse-item>
            <n-collapse-item title="🎸" name="2">
              <n-data-table
                :columns="[{ title: 'Voter', key: 'email' }]"
                :data="
                  talentVoters.map((item) => {
                    return {
                      email: item?.email,
                    };
                  })
                "
                :pagination="{ pageSize: 10 }"
                :bordered="false"
              />
            </n-collapse-item>
          </n-collapse>
          <n-button
            class="w-full"
            size="large"
            @click="$router.push({ path: '/' })"
            >Back</n-button
          >
        </n-card>
        <VoteStats
          class="mb-4"
          title="🌍"
          :totalVoteMember="videoVoters"
          :stats="videoDashboard"
          post-id="video"
        />
        <VoteStats
          title="🎸"
          :totalVoteMember="talentVoters"
          :stats="talentDashboard"
          post-id="talent"
        />
      </div>
    </div>
  </n-space>
</template>

<script>
import { API } from "aws-amplify";
export default {
  data() {
    return {
      videoVoters: [],
      talentVoters: [],
      talentDashboard: {},
      videoDashboard: {},
      isLoading: true,
    };
  },
  mounted() {
    this.fetchCandidates();
    this.fetchVoteUsers();
  },
  computed: {
    formatVideoVoters() {
      return this.videoVoters.map((item) => {
        return {
          email: item?.email,
        };
      });
    },
  },
  methods: {
    async fetchCandidates() {
      const listCandidates = `
        query ListCandidates(
          $filter: ModelCandidateFilterInput
          $limit: Int
          $nextToken: String
        ) {
          listCandidates(
            filter: $filter
            limit: $limit
            nextToken: $nextToken
          ) {
            items {
              id
              email
              postId
            }
            nextToken
          }
        }
      `;
      const res = await API.graphql({
        query: listCandidates,
        variables: {
          limit: 100,
        },
      });
      const data = res.data?.listCandidates?.items;
      this.videoVoters = data?.filter((item) => {
        return item.postId === "video";
      });
      this.talentVoters = data?.filter((item) => {
        return item.postId === "talent";
      });
    },
    async fetchVoteUsers() {
      this.isLoading = true;
      try {
        const getDashboard = `
        query GetDashboard($postId: String!) {
          getDashboard(postId: $postId)
        }
      `;
        let input;
        let res;
        let data;

        input = {
          postId: "video",
        };
        res = await API.graphql({
          query: getDashboard,
          variables: input,
        });
        data = JSON.parse(res.data.getDashboard);
        this.videoDashboard = JSON.parse(data?.body);

        input = {
          postId: "talent",
        };
        res = await API.graphql({
          query: getDashboard,
          variables: input,
        });
        data = JSON.parse(res.data.getDashboard);
        this.talentDashboard = JSON.parse(data?.body);
        this.isLoading = false;
      } catch (error) {
        this.isLoading = false;
      }
    },
  },
};
</script>
