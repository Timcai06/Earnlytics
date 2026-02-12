# Component Documentation

## UI Components

### Skeleton
Loading placeholder component.

**Props:**
- `variant`: `'text' | 'circular' | 'rectangular' | 'rounded'`
- `animation`: `'pulse' | 'wave' | 'none'`
- `className`: `string`

**Usage:**
```tsx
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

<Skeleton variant="text" className="w-32 h-4" />
<CardSkeleton />
```

### EmptyState
Display when no data is available.

**Props:**
- `icon`: `'chart' | 'search' | 'file' | 'company' | 'calendar'`
- `title`: `string`
- `description`: `string`
- `action`: `{ label: string; onClick: () => void }`

**Usage:**
```tsx
import { NoDataState, SearchEmptyState } from "@/components/ui/empty-state";

<NoDataState />
<SearchEmptyState query="Apple" />
```

### Toast
Notification system.

**Props:**
- `variant`: `'default' | 'success' | 'error' | 'warning' | 'info'`
- `title`: `string`
- `description`: `string`
- `duration`: `number` (ms)

**Usage:**
```tsx
import { useToast } from "@/components/ui/toast";

const { toast } = useToast();

toast({
  title: "Success",
  description: "Data saved successfully",
  variant: "success"
});
```

## Animation Components

### PageTransition

Wrap pages for smooth transitions.

**Props:**
- `variant`: `'fade' | 'slide' | 'scale'`
- `duration`: `number`

**Usage:**
```tsx
import { PageTransition } from "@/components/animation";

<PageTransition variant="fade">
  {children}
</PageTransition>
```

### AnimatedCard

Card with hover animations.

**Props:**
- `whileHover`: `object`
- `whileTap`: `object`
- All Framer Motion props

**Usage:**
```tsx
import { AnimatedCard } from "@/components/animation";

<AnimatedCard whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
  <h3>Card Title</h3>
</AnimatedCard>
```

### AnimatedButton

Button with interaction feedback.

**Props:**
- `isLoading`: `boolean`
- `loadingText`: `string`

**Usage:**
```tsx
import { AnimatedButton } from "@/components/animation";

<AnimatedButton 
  isLoading={isSubmitting}
  loadingText="Saving..."
>
  Submit
</AnimatedButton>
```

### StaggerContainer

Animate children with staggered delays.

**Props:**
- `staggerDelay`: `number`
- `children`: `ReactNode`

**Usage:**
```tsx
import { StaggerContainer, StaggerItem } from "@/components/animation";

<StaggerContainer staggerDelay={0.1}>
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Card data={item} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

## Performance Components

### OptimizedImage

Lazy-loading image with blur placeholder.

**Props:**
- `src`: `string`
- `alt`: `string`
- `priority`: `boolean` (above-fold images)
- `fill`: `boolean` (fill container)

**Usage:**
```tsx
import { OptimizedImage } from "@/components/performance";

<OptimizedImage
  src="/hero.jpg"
  alt="Hero image"
  priority
  className="rounded-lg"
/>
```

### VirtualList

Efficiently render large lists.

**Props:**
- `items`: `T[]`
- `renderItem`: `(item: T, index: number) => ReactNode`
- `itemHeight`: `number`
- `containerHeight`: `number`

**Usage:**
```tsx
import { VirtualList } from "@/components/performance";

<VirtualList
  items={companies}
  itemHeight={80}
  containerHeight={600}
  renderItem={(company) => <CompanyCard company={company} />}
/>
```

### PerformanceMonitor

Monitor Core Web Vitals.

**Usage:**
```tsx
import { PerformanceMonitor } from "@/components/performance";

// Add to layout.tsx
<PerformanceMonitor />
```

## Hooks

### usePerformanceMonitoring

Track performance metrics.

```tsx
const { metrics, getMetrics } = usePerformanceMonitoring();

// Access metrics
console.log(metrics.lcp); // Largest Contentful Paint
console.log(metrics.fid); // First Input Delay
console.log(metrics.cls); // Cumulative Layout Shift
```

### useLazyLoad

Lazy load content when in viewport.

```tsx
const { ref, isVisible } = useLazyLoad<HTMLDivElement>();

<div ref={ref}>
  {isVisible && <HeavyComponent />}
</div>
```

### useDebounce

Debounce values for search inputs.

```tsx
const debouncedSearch = useDebounce(searchTerm, 300);

// Use debouncedSearch for API calls
useEffect(() => {
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

### useThrottle

Throttle function calls.

```tsx
const throttledScroll = useThrottle(handleScroll, 100);

window.addEventListener("scroll", throttledScroll);
```

### useABTest

Access A/B test variants.

```tsx
const { variant, trackEvent } = useABTest("experiment-id");

<button 
  style={{ background: variant?.config.color }}
  onClick={() => trackEvent("conversion")}
>
  {variant?.config.buttonText}
</button>
```

### useKeyboardNavigation

Keyboard accessibility hooks.

```tsx
// Focus trap for modals
const containerRef = useFocusTrap(isOpen);

// Keyboard shortcuts
useKeyboardShortcut("Escape", closeModal);
useKeyboardShortcut("k", openSearch, { ctrl: true });

// Arrow navigation
const listRef = useArrowNavigation(".list-item", setActiveIndex, activeIndex);
```

### useAria

ARIA accessibility utilities.

```tsx
// Live region for announcements
const { liveRegionProps } = useLiveRegion({ 
  message: "Data updated",
  priority: "polite" 
});

// Visually hidden content
<VisuallyHidden>Screen reader only text</VisuallyHidden>

// Loading state
<LoadingState message="加载数据中" />
```

## Data Export

### exportToCSV

Export data to CSV file.

```tsx
import { exportToCSV } from "@/lib/export";

exportToCSV(data, "filename", {
  headers: { name: "Name", value: "Value" }
});
```

### exportToExcel

Export data to Excel file.

```tsx
import { exportToExcel } from "@/lib/export";

exportToExcel(data, "filename", {
  sheetName: "Earnings"
});
```

### exportToPDF

Export data to PDF file.

```tsx
import { exportToPDF } from "@/lib/export";

exportToPDF(data, "filename", {
  title: "Earnings Report",
  orientation: "landscape"
});
```

### exportChartToPNG

Export chart to PNG image.

```tsx
import { exportChartToPNG } from "@/lib/export";

const chartRef = useRef<HTMLDivElement>(null);

const handleExport = () => {
  exportChartToPNG(chartRef.current, "chart.png");
};
```
