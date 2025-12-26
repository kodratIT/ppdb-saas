<script lang="ts">
  import Card from "$lib/components/ui/card.svelte";
  import CardHeader from "$lib/components/ui/card-header.svelte";
  import CardTitle from "$lib/components/ui/card-title.svelte";
  import CardDescription from "$lib/components/ui/card-description.svelte";
  import CardContent from "$lib/components/ui/card-content.svelte";
  import CardFooter from "$lib/components/ui/card-footer.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";

  let email = "";
  let password = "";
</script>

<div
  class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4"
>
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-slate-900 mb-2">PPDB SaaS</h1>
      <p class="text-slate-600">Platform Pembelajaran Database Terpadu</p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Selamat Datang</CardTitle>
        <CardDescription>Masuk ke akun Anda untuk melanjutkan</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <label
            for="email"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >Email</label
          >
          <Input id="email" type="email" placeholder="nama@email.com" bind:value={email} />
        </div>
        <div class="space-y-2">
          <label
            for="password"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >Password</label
          >
          <Input
            id="password"
            type="password"
            placeholder="Masukkan password"
            bind:value={password}
          />
        </div>
        <Button class="w-full">Masuk</Button>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-slate-600">
          Belum punya akun?
          <a href={import.meta.env.BASE_URL + "register"} class="text-primary hover:underline"
            >Daftar sekarang</a
          >
        </p>
      </CardFooter>
    </Card>

    <div class="mt-8 grid grid-cols-3 gap-4">
      <Card>
        <CardContent class="p-4 text-center">
          <div class="text-2xl font-bold text-primary">50+</div>
          <div class="text-xs text-muted-foreground mt-1">Fitur Database</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-4 text-center">
          <div class="text-2xl font-bold text-primary">10K+</div>
          <div class="text-xs text-muted-foreground mt-1">Pengguna Aktif</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-4 text-center">
          <div class="text-2xl font-bold text-primary">99.9%</div>
          <div class="text-xs text-muted-foreground mt-1">Uptime</div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
