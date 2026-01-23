<template>
  <div class="relative pt-24 z-10">
    <div class="container px-24 mx-auto">
      <div class="container max-w-2xl mx-auto">
        <div class="sm:flex flex-row justify-between justify-items-center items-end hidden">
            <AssociationsMenu />
        </div>
      </div>
    </div>
  </div>
  
</template> 
<script setup>
const { data: associations } = useAssociationStories()
</script>