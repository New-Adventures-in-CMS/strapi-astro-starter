import Tabs from "./Tabs.astro";
import TabsContent from "./TabsContent.astro";
import TabsIndicator from "./TabsIndicator.astro";
import TabsList from "./TabsList.astro";
import TabsTrigger from "./TabsTrigger.astro";
import { tabs, tabsContent, tabsIndicator, tabsList, tabsTrigger } from "./variants";

const TabsVariants = {
  tabs,
  tabsContent,
  tabsIndicator,
  tabsList,
  tabsTrigger,
};

const TabsParts = {
  Root: Tabs,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Indicator: TabsIndicator,
};

export { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger, TabsVariants };

export default TabsParts;
