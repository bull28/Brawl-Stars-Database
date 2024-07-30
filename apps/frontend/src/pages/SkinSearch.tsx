import {useState} from "react";
import {
    Flex, Box, SimpleGrid, Text, Button, FormControl, FormLabel,
    Input, RadioGroup, Radio, Select, Image
} from "@chakra-ui/react";
import {ChevronLeftIcon, ChevronRightIcon} from "@chakra-ui/icons";
import axios, {AxiosResponse} from "axios";
import {animateScroll} from "react-scroll";
import {SkinSearchFilters, SkinSearchResult} from "../types/BrawlerData";
import BackButton from "../components/BackButton";
import api from "../helpers/APIRoute";
import cdn from "../helpers/CDNRoute";

export default function SkinSearch(){
    const resultsPerPage = 40;

    const [imagePath, setImagePath] = useState<string>("");
    const [backgroundPath, setBackgroundPath] = useState<string>("");
    const [results, setResults] = useState<SkinSearchResult["results"]>([]);
    const [page, setPage] = useState<number>(0);

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
            const {query, rarity, bling, limited, startMonth, startYear, endMonth, endYear} = target;
            if (query !== undefined){
                filters.query = query.value;
            }
            if (rarity !== undefined){
                const rarityValue = parseInt(rarity.value);
                if (rarityValue >= 0){
                    filters.rarity = rarityValue;
                }
            }
            if (bling !== undefined){
                if (bling.value === "yes"){
                    filters.bling = true;
                } if (bling.value === "no"){
                    filters.bling = false;
                }
            }
            if (limited !== undefined){
                if (limited.value === "yes"){
                    filters.limited = true;
                } if (limited.value === "no"){
                    filters.limited = false;
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
        .catch((error) => {
        });
    };

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
        <Flex w={"100%"} flexDir={"column"} alignItems={"center"}>
            <BackButton/>
            <Text fontSize={"4xl"} className={"heading-4xl"}>Skin Search</Text>
            <Box bgColor={"#000000c0"} p={3} borderRadius={"xl"} maxW={"100%"}>
                <form onSubmit={formSubmit}>
                    <FormControl className={"skinsearch-form-control"}>
                        <FormLabel m={0}>Name</FormLabel>
                        <Input name={"query"}/>
                    </FormControl>
                    <FormControl className={"skinsearch-form-control"}>
                        <FormLabel m={0}>Rarity</FormLabel>
                        <RadioGroup name={"rarity"} defaultValue={"-1"}>
                            <Flex gap={3} wrap={"wrap"}>
                                <Radio value={"-1"}>Any</Radio>
                                <Radio value={"0"}>No Rarity</Radio>
                            </Flex>
                            <Flex gap={3} wrap={"wrap"}>
                                <Radio value={"1"}>Rare</Radio>
                                <Radio value={"2"}>Super Rare</Radio>
                                <Radio value={"3"}>Epic</Radio>
                                <Radio value={"4"}>Mythic</Radio>
                                <Radio value={"5"}>Legendary</Radio>
                            </Flex>
                            <Flex gap={3} wrap={"wrap"}>
                                <Radio value={"6"}>Hypercharge</Radio>
                                <Radio value={"7"}>Collectors</Radio>
                            </Flex>
                        </RadioGroup>
                    </FormControl>
                    <FormControl className={"skinsearch-form-control"}>
                        <FormLabel m={0}>Can be purchased with Bling</FormLabel>
                        <RadioGroup name={"bling"} defaultValue={"off"}>
                            <Flex gap={3}>
                                <Radio value={"off"}>Any</Radio>
                                <Radio value={"yes"}>Yes</Radio>
                                <Radio value={"no"}>No</Radio>
                            </Flex>
                        </RadioGroup>
                    </FormControl>
                    <FormControl className={"skinsearch-form-control"}>
                        <FormLabel m={0}>Is a limited skin</FormLabel>
                        <RadioGroup name={"limited"} defaultValue={"off"}>
                            <Flex gap={3}>
                                <Radio value={"off"}>Any</Radio>
                                <Radio value={"yes"}>Yes</Radio>
                                <Radio value={"no"}>No</Radio>
                            </Flex>
                        </RadioGroup>
                    </FormControl>
                    <FormControl className={"skinsearch-form-control"}>
                        <FormLabel m={0}>Released After</FormLabel>
                        <Flex>
                            <Select name={"startMonth"} placeholder={"Month"}>{months.map((value, index) =>
                                <option key={value} value={`${index + 1}`}>{value}</option>
                            )}
                            </Select>
                            <Select name={"startYear"} placeholder={"Year"}>{years.map((value) =>
                                <option key={value} value={value}>{value}</option>
                            )}
                            </Select>
                        </Flex>
                    </FormControl>
                    <FormControl className={"skinsearch-form-control"}>
                    <FormLabel m={0}>Released Before</FormLabel>
                        <Flex>
                            <Select name={"endMonth"} placeholder={"Month"}>{months.map((value, index) =>
                                <option key={value} value={`${index + 1}`}>{value}</option>
                            )}
                            </Select>
                            <Select name={"endYear"} placeholder={"Year"}>{years.map((value) =>
                                <option key={value} value={value}>{value}</option>
                            )}
                            </Select>
                        </Flex>
                    </FormControl>
                    <Button type={"submit"} w={"100%"}>Search</Button>
                </form>
            </Box>
            <Box mt={5} mb={3} w={"100%"}>
            {results.length > 0 ?
                <>
                <Text fontSize={"xl"} className={"heading-xl"} textAlign={"center"}>{`Skins ${Math.min(page * resultsPerPage + 1, results.length)} to ${Math.min((page + 1) * resultsPerPage, results.length)} of ${results.length}`}</Text>
                <Flex flexDir={"column"} w={"100%"} my={2} px={6}>
                    <SimpleGrid columns={[1, 2, 2, 3, 4]} spacingX={6} spacingY={8}>{results.slice(page * resultsPerPage, (page + 1) * resultsPerPage).map((data) =>
                        <Flex key={data.name} bgColor={"#0000"} flexDir={"column"} alignItems={"center"}>
                            <Flex w={"100%"} h={"100%"} p={[0, 1]} bgImage={`${cdn}/image/${backgroundPath}${data.background}`} borderRadius={"lg"} bgPos={"center"} bgSize={"cover"} bgRepeat={"no-repeat"} justifyContent={"center"}>
                                <Image objectFit={"contain"} src={`${cdn}/image/${imagePath}${data.brawler}/${data.image}`} alt={data.displayName}/>
                            </Flex>
                            <Text fontSize={"2xl"} className={"heading-2xl"}>{data.displayName}</Text>
                        </Flex>
                    )}</SimpleGrid>
                </Flex>
                <Flex justifyContent={"center"}>
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
                </>
                :
                <Text fontSize={"xl"} className={"heading-xl"} textAlign={"center"}>{imagePath === "" || backgroundPath === "" ? "" : "No skins found"}</Text>
                }
            </Box>
        </Flex>
    );
}
