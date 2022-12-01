<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <h3 class="author">
        @{{ freet.author }}
      </h3>
      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >

      <!-- Add another Vue file and then import it -->
        <button @click="deleteFreet">
          🗑️ Delete
        </button>
      </div>
    </header>
    <p
      class="content"
    >
      {{ freet.content }}
    </p>

      <!-- Adding Upvote -->
    <button 
      v-if="$store.state.username != null"
      @click="requestUpvote()" >
        ⬆️ Upvote
    </button>
    <p class="info">
      Posted at {{ freet.dateCreated }}
    </p>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </article>
</template>
<script>

export default {
  name: 'FreetComponent',
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    async request(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
    async requestUpvote() {
      /**
       * Requesting Upvote
       * @param params.callback - Function to run if the the request succeeds
      */
      const options = {
        method: 'POST', headers: {'Content-Type': 'application/json'}
      };
      const params = {
        method: 'POST',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully upvoted freet!', status: 'success'
          });
        }
      };
      try {
        const upvote = await fetch(`/api/upvotes/${this.freet._id}`, options);
        if (!upvote.ok) {
          const res = await upvote.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshUpvotes');
        
        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
.freet {
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}
</style>
