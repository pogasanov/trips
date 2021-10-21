<template>
    <router-link
        :to="{name: routeName}"
        v-slot="props">
        <li
            :class="[props.isActive && 'bg-blue-700 text-white']"
            @click="props.navigate"
            class="py-3 px-1 cursor-pointer rounded hover:text-white">
            <a :href="props.href" class="flex" role="button">
                <slot></slot>
            </a>
        </li>
    </router-link>
</template>

<script lang="ts">
export default {
    name: "MenuLink",
    props: {
        routeName: {
            type: String,
            required: true,
        }
    }
}
</script>