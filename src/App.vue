<template>
  <div class="page-container">
    <md-app md-waterfall md-mode="fixed">
      <md-app-toolbar class="md-primary" >
        <md-button class="md-icon-button" @click="menuVisible = !menuVisible" >
          <md-icon>menu</md-icon>
        </md-button>
        <span class="md-title">Are you happy?</span>
        <div class="md-toolbar-section-end">
          <md-avatar class="md-avatar-icon md-small" >
            <md-icon>account_circle</md-icon>
            <!-- <img src="/assets/logo.png" > -->
          </md-avatar>
        </div>
      </md-app-toolbar>

      <md-app-drawer :md-active.sync="menuVisible" >
        <md-toolbar class="md-transparent" md-elevation="0" >
          Menu
        </md-toolbar>

        <md-list>
          <md-list-item @click="goto('/')" >
            <md-icon>home</md-icon>
            <span class="md-list-item-text" >Home</span>
          </md-list-item>
          <md-list-item @click="goto('/help')" >
            <md-icon>help</md-icon>
            <span class="md-list-item-text" >Help</span>
          </md-list-item>
          <md-list-item @click="goto('/private')">
            <md-icon>lock</md-icon>
            <span class="md-list-item-text">개인정보 취급방침</span>
          </md-list-item>
          <md-list-item @click="goto('/terms')" >
            <md-icon>polymer</md-icon>
            <span class="md-list-item-text">서비스 이용약관</span>
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content>
        <router-view/>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
export default {
  name: 'App',
  data(){
    return { menuVisible: false };
  },
  methods: {
    goto(path){
      this.$router.push(path);
      this.menuVisible = false;
    }
  }
};
</script>

<style>
  .md-app {
    /*max-height: 400px;*/
    min-height: 300px;
    height: 100%;
    border: 1px solid rgba(#000, .12);
  }

   // Demo purposes only
  .md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
  }

  .md-toolbar-section-end {
    width: 100px;
  }
</style>
