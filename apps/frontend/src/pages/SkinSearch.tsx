import {useState, useEffect, useRef} from "react";
import {
    Flex, Box, SimpleGrid, Text, Button, FormControl, FormLabel,
    Input, RadioGroup, Radio, Select, Image, useDisclosure
} from "@chakra-ui/react";
import {ChevronLeftIcon, ChevronRightIcon} from "@chakra-ui/icons";
import axios, {AxiosResponse} from "axios";
import {animateScroll} from "react-scroll";
import {SkinData, SkinSearchFilters, SkinSearchResult} from "../types/BrawlerData";
import SkinDetails from "../components/SkinDetails";
import BackButton from "../components/BackButton";
import api from "../helpers/APIRoute";
import cdn from "../helpers/CDNRoute";

export default function SkinSearch(){
    const resultsPerPage = 40;

    const [skinGroups, setSkinGroups] = useState<string[]>([]);
    const [skinRewards, setSkinRewards] = useState<string[]>([]);
    const [imagePath, setImagePath] = useState<string>("");
    const [backgroundPath, setBackgroundPath] = useState<string>("");
    const [results, setResults] = useState<SkinSearchResult["results"]>([]);
    const [page, setPage] = useState<number>(0);
    const [currentSkin, setCurrentSkin] = useState<SkinData | undefined>();

    const [rarity, setRarity] = useState<string>("-1");
    const [bling, setBling] = useState<string>("any");
    const [limited, setLimited] = useState<string>("any");

    const savedSkins = useRef<Map<string, SkinData>>(new Map());
    const formRef = useRef<HTMLFormElement>(null);

    const {isOpen, onOpen, onClose} = useDisclosure();

    const changePage = (change: number) => {
        if (change < 0){
            setPage(Math.max(0, page + change));
        } else if (change > 0){
            setPage(Math.min(Math.ceil(results.length / resultsPerPage) - 1, page + change));
        }
        animateScroll.scrollToTop({duration: 0});
    };

    const formSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const filters: SkinSearchFilters = {};

        const target = event.target;
        if (target instanceof HTMLFormElement){
            const {query, skinGroup, skinReward, startMonth, startYear, endMonth, endYear} = target;
            if (query !== undefined){
                filters.query = query.value;
            }
            const rarityValue = parseInt(rarity);
            if (rarityValue >= 0){
                filters.rarity = rarityValue;
            }
            if (bling === "yes"){
                filters.bling = true;
            } else if (bling === "no"){
                filters.bling = false;
            }
            if (limited === "yes"){
                filters.limited = true;
            } else if (limited === "no"){
                filters.limited = false;
            }
            if (skinGroup !== undefined){
                const groupIndex = parseInt(skinGroup.value);
                if (groupIndex >= 0 && groupIndex < skinGroups.length){
                    filters.groups = [skinGroups[groupIndex]];
                }
            }
            if (skinReward !== undefined){
                const rewardIndex = parseInt(skinReward.value);
                if (rewardIndex >= 0 && rewardIndex < skinRewards.length){
                    filters.foundIn = skinRewards[rewardIndex];
                }
            }
            if (startMonth !== undefined && startYear !== undefined){
                const startMonthValue = parseInt(startMonth.value);
                const startYearValue = parseInt(startYear.value);
                if (!isNaN(startMonthValue) && !isNaN(startYearValue)){
                    filters.startDate = {month: startMonthValue, year: startYearValue};
                }
            }
            if (endMonth !== undefined && endYear !== undefined){
                const endMonthValue = parseInt(endMonth.value);
                const endYearValue = parseInt(endYear.value);
                if (!isNaN(endMonthValue) && !isNaN(endYearValue)){
                    filters.endDate = {month: endMonthValue, year: endYearValue};
                }
            }
        }

        axios.post<{}, AxiosResponse<SkinSearchResult>>(`${api}/skinsearch`, {filters: filters})
        .then((res) => {
            setImagePath(res.data.imagePath);
            setBackgroundPath(res.data.backgroundPath);
            setResults(res.data.results);
            setPage(0);
        })
        .catch(() => {});
    };

    const formReset = () => {
        if (formRef.current === null){
            return;
        }

        const {query, skinGroup, skinReward, startMonth, startYear, endMonth, endYear} = formRef.current;

        for (const x of [query, skinGroup, skinReward, startMonth, startYear, endMonth, endYear]){
            if (x !== undefined){
                x.value = "";
            }
        }
        setRarity("-1");
        setBling("any");
        setLimited("any");
    };

    const getSkinData = (brawler: string, skin: string) => {
        const skinData = savedSkins.current.get(skin);
        if (skinData !== undefined){
            setCurrentSkin(skinData);
            onOpen();
            return;
        }
        axios.get<{}, AxiosResponse<SkinData>>(`${api}/skin/${brawler}/${skin}`)
        .then((res) => {
            if (res.data.name === skin){
                savedSkins.current.set(skin, res.data);
                setCurrentSkin(res.data);
                onOpen();
            }
        })
        .catch(() => {});
    };

    useEffect(() => {
        axios.get<{}, AxiosResponse<string[]>>(`${api}/skingroups`)
        .then((res) => {
            const groups = res.data;
            groups.sort();
            setSkinGroups(groups);
        })
        .catch(() => setSkinGroups([]));

        axios.get<{}, AxiosResponse<string[]>>(`${api}/skinfoundin`)
        .then((res) => {
            const rewards = res.data;
            rewards.sort();
            setSkinRewards(rewards);
        })
        .catch(() => setSkinRewards([]));
    }, []);

    const months: string[] = [];
    const years: string[] = [];
    const currentYear = new Date().getFullYear();
    for (let x = 0; x < 12; x++){
        months.push(new Date(2024, x).toLocaleDateString("default", {"month": "long"}));
    }
    for (let x = 2017; x <= currentYear; x++){
        years.push(`${x}`);
    }

    return (
        <Flex w={"100%"} minH={"101vh"} flexDir={"column"} alignItems={"center"}>
            <BackButton/>
            <Text fontSize={"4xl"} className={"heading-4xl"}>Skin Search</Text>
            <Box bgColor={"#000000c0"} mt={3} p={3} borderRadius={"xl"} maxW={"100%"}>
                <form onSubmit={formSubmit} ref={formRef}>
                    <FormControl className={"skinsearch-form-control"}>
                        <FormLabel m={0}>Name</FormLabel>
                        <Input name={"query"}/>
                    </FormControl>
                    <FormControl className={"skinsearch-form-control"}>
                        <Text userSelect={"none"}>Rarity</Text>
                        <RadioGroup name={"rarity"} defaultValue={"-1"} value={rarity} onChange={setRarity}>
                            <Flex gap={3} wrap={"wrap"}>
                                <Radio value={"-1"}>Any</Radio>
                                <Radio value={"1"}>Rare</Radio>
                                <Radio value={"2"}>Super Rare</Radio>
                                <Radio value={"3"}>Epic</Radio>
                                <Radio value={"4"}>Mythic</Radio>
                                <Radio value={"5"}>Legendary</Radio>
                                <Radio value={"6"}>Hypercharge</Radio>
                            </Flex>
                        </RadioGroup>
                    </FormControl>
                    <FormControl className={"skinsearch-form-control"}>
                        <Text userSelect={"none"}>Can be purchased with Bling</Text>
                        <RadioGroup name={"bling"} defaultValue={"any"} value={bling} onChange={setBling}>
                            <Flex gap={3}>
                                <Radio value={"any"}>Any</Radio>
                                <Radio value={"yes"}>Yes</Radio>
                                <Radio value={"no"}>No</Radio>
                            </Flex>
                        </RadioGroup>
                    </FormControl>
                    <FormControl className={"skinsearch-form-control"}>
                        <Text userSelect={"none"}>Is a limited skin</Text>
                        <RadioGroup name={"limited"} defaultValue={"any"} value={limited} onChange={setLimited}>
                            <Flex gap={3}>
                                <Radio value={"any"}>Any</Radio>
                                <Radio value={"yes"}>Yes</Radio>
                                <Radio value={"no"}>No</Radio>
                            </Flex>
                        </RadioGroup>
                    </FormControl>
                    <FormControl className={"skinsearch-form-control"}>
                        <FormLabel m={0}>Skin Group</FormLabel>
                        <Select name={"skinGroup"} placeholder={"Any Group"}>{skinGroups.map((value, index) =>
                            <option key={value} value={`${index}`}>{value}</option>
                        )}</Select>
                    </FormControl>
                    <FormControl className={"skinsearch-form-control"}>
                        <FormLabel m={0}>Can be found in</FormLabel>
                        <Select name={"skinReward"} placeholder={"Anywhere"}>{skinRewards.map((value, index) =>
                            <option key={value} value={`${index}`}>{value}</option>
                        )}</Select>
                    </FormControl>
                    <Flex w={"100%"} gap={[0, 5]} flexDir={["column", "row"]}>
                        <Box flex={1}>
                            <Text userSelect={"none"}>Released After or During</Text>
                            <Flex>
                                <FormControl className={"skinsearch-form-control"}>
                                    <Select name={"startMonth"} placeholder={"Month"}>{months.map((value, index) =>
                                        <option key={value} value={`${index + 1}`}>{value}</option>
                                    )}
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <Select name={"startYear"} placeholder={"Year"}>{years.map((value) =>
                                        <option key={value} value={value}>{value}</option>
                                    )}
                                    </Select>
                                </FormControl>
                            </Flex>
                        </Box>
                        <Box flex={1}>
                            <Text userSelect={"none"}>Released Before or During</Text>
                            <Flex>
                                <FormControl className={"skinsearch-form-control"}>
                                    <Select name={"endMonth"} placeholder={"Month"}>{months.map((value, index) =>
                                        <option key={value} value={`${index + 1}`}>{value}</option>
                                    )}
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <Select name={"endYear"} placeholder={"Year"}>{years.map((value) =>
                                        <option key={value} value={value}>{value}</option>
                                    )}
                                    </Select>
                                </FormControl>
                            </Flex>
                        </Box>
                    </Flex>
                    <Button w={"100%"} mb={1} onClick={formReset}>Reset Filters</Button>
                    <Button type={"submit"} w={"100%"}>Search</Button>
                </form>
            </Box>
            <Box mt={5} mb={"3em"} w={"100%"}>
            {results.length > 0 ?
                <>
                <Text fontSize={"xl"} className={"heading-xl"} textAlign={"center"}>{`Skins ${Math.min(page * resultsPerPage + 1, results.length)} to ${Math.min((page + 1) * resultsPerPage, results.length)} of ${results.length}`}</Text>
                <Flex flexDir={"column"} w={"100%"} mt={2} px={6}>
                    <SimpleGrid columns={[1, 2, 2, 3, 4]} spacingX={6} spacingY={8}>{results.slice(page * resultsPerPage, (page + 1) * resultsPerPage).map((data) =>
                        <Flex key={data.name} flexDir={"column"} alignItems={"center"}>
                            <Flex w={"100%"} h={"100%"} p={[0, 1]} bgImage={`${cdn}/image/${backgroundPath}${data.background}`} borderRadius={"lg"} bgPos={"center"} bgSize={"cover"} bgRepeat={"no-repeat"} justifyContent={"center"} onClick={() => {getSkinData(data.brawler, data.name);}}>
                                <Image objectFit={"contain"} src={`${cdn}/image/${imagePath}${data.brawler}/${data.image}`} alt={data.displayName}/>
                            </Flex>
                            <Text fontSize={"2xl"} className={"heading-2xl"}>{data.displayName}</Text>
                        </Flex>
                    )}</SimpleGrid>
                </Flex>
                <Flex w={"100vw"} justifyContent={"center"} pos={"fixed"} bottom={0}>
                    <Flex bgColor={"#000"} borderRadius={"lg"}>
                        <Button p={0} isDisabled={page <= 0} onClick={() => changePage(-1)}>
                            <ChevronLeftIcon fontSize={"4xl"}/>
                        </Button>
                        <Flex minW={["3em", "7em"]} px={2} bgColor={"gray.200"} borderRadius={"lg"} justifyContent={"center"} alignItems={"center"}>
                            <Text fontSize={"2xl"} className={"heading-2xl"}>{`${page + 1} of ${Math.ceil(results.length / resultsPerPage)}`}</Text>
                        </Flex>
                        <Button p={0} isDisabled={page >= Math.ceil(results.length / resultsPerPage) - 1} onClick={() => changePage(1)}>
                            <ChevronRightIcon fontSize={"4xl"}/>
                        </Button>
                    </Flex>
                </Flex>
                {currentSkin !== undefined && <SkinDetails data={currentSkin} isOpen={isOpen} onClose={onClose}/>}
                </>
                :
                <Text fontSize={"xl"} className={"heading-xl"} textAlign={"center"}>{imagePath === "" || backgroundPath === "" ? "" : "No skins found"}</Text>
            }
            </Box>
        </Flex>
    );
}
