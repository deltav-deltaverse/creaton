import { FC, useEffect, useState, useContext } from "react";
import {useWeb3React} from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { gql, useQuery } from "@apollo/client";
import { Token } from "../components/nftlance.token";
import {Link} from "react-router-dom";
import { Button } from "../elements/button";


export const MytokensRequests: FC = () => {
    const web3Context = useWeb3React();
    const [userAddress, setUserAddress] = useState("");
    const [tokens, setTokens] = useState([]);

    useEffect(() => {
        (async function iife() {
            const provider = web3Context.provider as Web3Provider;
            if(!provider) return;

            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            setUserAddress(userAddress);
        })();
    }, [web3Context]);

    const CONTENTS_QUERY = gql`
        query GET_COLLECTIONS($creatorAddress: Bytes!) {
            creatorCollections (where: {creator: $creatorAddress}) {
                id
                catalogs {
                    id
                    title
                    description
                    cards {
                        id
                        price
                        tokens (where:{state: "PURCHASED", requestData_not: ""}) {
                            id
                            tokenId
                            state
                            owner
                            requestData
                            card {
                                id
                                cardId
                                price
                                catalog {
                                    id
                                    catalogId
                                    title
                                    description
                                    artist {
                                        id
                                        creatorContract
                                        profile {
                                            id
                                            data
                                        }
                                    }
                                    creatorCollection {
                                        id
                                        token
                                        collectible {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    const contentsQuery = useQuery(CONTENTS_QUERY, {variables: {creatorAddress: userAddress.toLocaleLowerCase()}});

    useEffect(() => {
        (async function iife() {
            const tokens: any = [];
            if(contentsQuery.data && contentsQuery.data.creatorCollections){
                contentsQuery.data.creatorCollections[0].catalogs.map((catalog, i) => {
                    return catalog.cards.map((card, x) => {
                        return card.tokens.map((token, z) => {
                            tokens.push(token);
                        });
                    });
                })
            }

            setTokens(tokens);
        })();
    }, [contentsQuery]);


    return (
        <div className="max-w-5xl my-0 mx-auto text-center text-center pt-10">
            {tokens.length > 0 && <>
                {tokens.map((token, z) => (
                    <Token creator={true} key={`token-${z}`} token={token} />
                ))}
            </>}
            {tokens.length <= 0 && <h2 className="text-white font-bold">No requests for your tokens</h2>}
        <Link to="/nftlance">
        <Button className="mt-3 mb-3" label="Go back" />
        </Link>
        </div>
    )
};