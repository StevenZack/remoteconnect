<script>

    import { getRoute } from "$lib";

</script>
<nav class="p">
    <a href="/">Home</a> | 
    <a href={getRoute('/join')}>Join</a>
</nav>
<hr>
<slot/>