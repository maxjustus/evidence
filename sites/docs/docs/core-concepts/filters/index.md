---
title: Filters
---

Filters dynamically change what data is shown _in a specific component_.

:::tip
Adding too many filters to a page increases mental load for end users, and the chance they could "get the wrong answer".
:::

To dynamically change data _across a whole page_, [templated pages](../templated-pages) are more suitable and intuitive for end users.

## Filtering via URL search parameters

Filters make use of _search parameters_ (a.k.a. "query strings") in the URL. Anything after the `?` in the URL is a search parameter.

- `orders?channel=google` has a search parameter `channel` with value `google`
- `orders?item=boxing%20gloves` has a search parameter `item` with value `boxing gloves`
- `orders?item=boxing%20gloves&status=shipped` has two search parameters `item`, and `status`

In Evidence, the value of a search parameter `channel` is accessible in a page via:

```js
{$page.url.searchParams.get('channel')}
```

## Ensuring builds do not look for search parameters

Evidence is a static site generator, meaning that it pre-builds all the html for the site before deployment. During build, there is no URL being accessed by a user in the browser, so you cannot access search parameters.

We must check if we are in a browser before accessing search parameters with the `browser` variable, which is `true` if the code is running in a browser, and `false` if it is during build.

```markdown
<script>
    import {browser} from "$app/environment";
</script>

<!-- Check we are in a browser and there is a filter in the URL -->
{#if browser && $page.url.searchParams.get('channel')}

The channel is {$page.url.searchParams.get('channel')} 

{/if}
```

## Generating filter URLS

For users to be able to interact with a filter, they require the ability to navigate to URLs with search parameters.

It's possible to create these links manually, but it's easier to generate them automatically:

### Add a filter using a `<DataTable/>` with a `link` prop

Construct unique values for each row, and create links for each row in the table.

````markdown
```sql channels
select
    channel,
    '?channel=' || channel as filter_link
from orders
group by 1

## Filter

<DataTable data={channels} link=filter_link />
```
````

## Filtering a query result

To filter the data shown by a component, use the javascript filter method on the query result.


```js title="Filter method"
.filter(d => d.channel === $page.url.searchParams.get('channel'))
```

:::tip
`searchParams.get()` always returns a string, so if your query column is not a string, use an `==` equality check instead of a `===` strict equality, e.g. `filter(d => d.id == $page.url.searchParams.get('id'))`
:::

## Full example

We can use this to filter a `<DataTable/>` component:

````markdown
<script>
    import {browser} from "$app/environment";
</script>

## Filtered Component

```sql items
select
    email,
    channel,
    sum(sales) as sales_usd
from orders
group by 1,2
```

{#if browser && $page.url.searchParams.get('channel')} <!-- Check we are in a browser and there is a filter in the URL -->

<DataTable data={items.filter(d=>d.channel === $page.url.searchParams.get('channel'))}/>

{:else} <!-- If not, show all data -->

<DataTable data={items}/>

{/if}
````

Now if a user navigates to www.example.com/orders?channel=google, the table will only show data for the `google` channel.

Note, if we didn't check for a filter in the URL, then the `.filter` would throw an error in the situation where there is no search parameter in the URL.
