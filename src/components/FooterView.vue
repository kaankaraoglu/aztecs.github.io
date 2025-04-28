<template>
    <footer class="footer">
        <p>&copy; {{ new Date().getFullYear() }} Aztecs. All rights reserved.</p>
    </footer>
</template>

<script>
export default {
    name: "FooterView",
};
</script>

<style scoped>
.footer {
    text-align: center;
    padding: 1rem;
    background-color: #f8f9fa;
    color: #6c757d;
    border-top: 1px solid #dee2e6;
}
</style>