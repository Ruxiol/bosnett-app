import TabHeading from "./tabbHeading";

export default interface TabsProps {
    tabs: TabHeading[];
    onTabPress: (tab: string) => void;
    activeTab: string;
}