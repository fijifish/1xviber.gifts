# @adsgram/react

React bindings for Adsgram SDK. Provides components and hooks for ad tasks and fullscreen banners.

## Installation

```bash
npm install @adsgram/react
# or
yarn add @adsgram/react
# or
pnpm add @adsgram/react
```

## Components

### `<AdsgramTask />`
React wrapper component for the `<adsgram-task>` custom element. Using for the [Task](https://docs.adsgram.ai/publisher/task-examples) ad format.

<img src="https://docs.adsgram.ai/assets/native_task.Dp3rdtR0.png" alt="Task ad" width="300">

#### Props
| Prop               | Type           | Description                             |
|--------------------|----------------|-----------------------------------------|
| `blockId`          | `string`       | Unique task block ID (required)         |
| `debug`            | `boolean`      | Enable debug mode (optional)            |
| `className`        | `string`       | Optional CSS class name (optional)      |
| `onReward`         | `EventHandler` | Reward event callback (optional)        |
| `onError`          | `EventHandler` | Error event callback (optional)         |
| `onBannerNotFound` | `EventHandler` | No banner available callback (optional) |
| `onTooLongSession` | `EventHandler` | Long session callback (optional)        |

#### Customization
More info about customization and slots usage see [here](https://docs.adsgram.ai/publisher/task-integration-example#_4-customise-task-so-it-fits-your-application-design)

#### Example
```tsx
import { JSX } from "react";
import { AdsgramTask } from '@adsgram/react';


export function Task(): JSX.Element | null {
  const handleReward = (event: CustomEvent<string>): void => {
    console.log("User earned reward:", event.detail);
  };
  
  const handleError = (event: CustomEvent<string>): void => {
    console.error("Task error:", event.detail);
  };

  return (
    <AdsgramTask blockId="task-123" className={styles.task} onReward={handleReward} onError={handleError}>
      <span slot="reward" className={styles.task__reward}>1000 coins</span>
      <div slot="button" className={styles.task__button}>go</div>
      <div slot="claim" className={styles.task__button_claim}>claim</div>
      <div slot="done" className={styles.task__button_done}>done</div>
    </AdsgramTask>
  );
}
```

### Hook

### `useAdsgram`
React hook for managing fullscreen ads. Using for the [Reward](https://docs.adsgram.ai/publisher/reward-examples) and [Interstitial](https://docs.adsgram.ai/publisher/interstitial-examples) ad formats.

<img src="https://docs.adsgram.ai/assets/rewarded_video.CdG2Ubqt.png" alt="Fullscreen ad" width="300">

#### Props
| Prop               | Type                           | Description                                       |
| ------------------ | ------------------------------ | ------------------------------------------------- |
| `blockId`          | `string`                       | Unique ad block ID (required)                     |
| `debug`            | `boolean`                      | Enable debug mode (optional)                      |
| `debugBannerType`  | `string`                       | Forced banner type in debug mode (optional)       |
| `onReward`         | `(event: CustomEvent) => void` | Handler for the `reward` event (optional)         |
| `onError`          | `(event: CustomEvent) => void` | Handler for the `error` event (optional)          |

#### Returns
An object with methods to control the Adsgram ad:
- `show(): Promise<ShowPromiseResult>` — Shows the ad and resolves with the result.
- `addEventListener(event: string, handler: (event: CustomEvent) => void): void` — Add event listener.
- `removeEventListener(event: string, handler: (event: CustomEvent) => void): void` — Remove event listener.
- `destroy(): void` — Destroys the ad controller.

#### Example
```tsx
import { JSX } from "react";
import { useAdsgram } from '@adsgram/react';

export function AdButton(): JSX.Element {
  const handleReward = (): void => {
    // user watch ad till the end
    // your code to reward user for rewarded format
  }

  const handleError = (): void => {
    // user get error during playing ad
    // do nothing or whatever you want
  },

  const { show } = useAdsgram({ blockId: '123', onReward: handleReward, onError: handleError });

  return <button onClick={show}>Show Ad</button>;
}
```
