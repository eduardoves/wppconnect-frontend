import React, {useEffect, useState} from "react";
import {Container, HeaderComponent, Layout, TableContainer} from "./style";
import {DataGrid} from "@material-ui/data-grid";
import api from "../../services/api";
import {getSession} from "../../services/auth";
import config from "../../util/sessionHeader";
import {LeftContainer, RightContainer} from "../GroupPage/style";
import {ListOrdered, Sheet, UserPlus} from "lucide-react";
import {
    JsonToCsv,
    useJsonToCsv
} from 'react-json-csv';

const {saveAsCsv} = useJsonToCsv();

const ContactsPage = () => {
    const [data, setData] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [, setSelected] = useState([]);

    useEffect(() => {
        getAllContacts();

        return () => {
            setContacts([]);
        };
    }, []);

    async function getAllContacts() {
        const {data} = await api.get(`${getSession()}/all-contacts`, config());
        const arr = [];

        for (const contact of data.response) {
            if (contact.isMyContact && contact.id.user !== undefined)
                arr.push(contact);
        }

        setContacts(arr);
        setData(arr);
    }

    const rows = contacts.map((contato, index) => {
        return {
            id: index,
            profileImage: contato.name,
            name: contato.name,
            phone: contato.id._serialized
        };
    });

    const columns = [
        {
            field: "profileImage",
            // eslint-disable-next-line react/display-name
            renderCell: (params) => (
                <img
                    src={`https://ui-avatars.com/api/?name=${params.value === undefined ? "ND" : params.value}?background=random`}
                    style={{width: 30, height: 30, borderRadius: "50%"}} alt={params.value}/>
            ),
            headerName: " ",
            width: "10%"
        },
        {
            field: "name",
            headerName: "Nome",
            width: "47.50%"
        },
        {
            field: "phone",
            headerName: "Telefone",
            width: "47.50%"
        },
    ];

    function searchContact(e) {
        let query = e.target.value;

        let users = data.filter((filtro) => {
                if (filtro.name !== undefined && filtro.id._serialized !== undefined) {
                    return filtro.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().indexOf(query.toLowerCase()) > -1 || filtro.id._serialized.indexOf(query) > -1;
                } else {
                    return [];
                }
            }
        );

        setContacts(users);

        if (query === "") {
            setContacts(data);
        }
    }

    const columnsExcel = () => {
        return ({
            "name": "Name",
            "phone": "Phone"
        })
    }

    return (
        <Layout>
            <Container>
                <LeftContainer>
                    <ul>
                        <li onClick={() => setSelected(1)}>
                            <div className={"wrapper-li"}>
                                <div className={"wrapper-ic"}>
                                    <ListOrdered/>
                                </div>
                                <div className={"wrapper-text"}>
                                    <h2>
                                        All Contacts
                                    </h2>
                                    <p>
                                        Manage all your groups.
                                    </p>
                                </div>
                            </div>
                        </li>

                        <li onClick={() => setSelected(2)}>
                            <div className={"wrapper-li"}>
                                <div className={"wrapper-ic"}>
                                    <UserPlus/>
                                </div>
                                <div className={"wrapper-text"}>
                                    <h2>
                                        Add Contacts (Soon)
                                    </h2>
                                    <p>
                                        Add contacts remotely.
                                    </p>
                                </div>
                            </div>
                        </li>

                        <li onClick={() => {
                            saveAsCsv({
                                data: rows,
                                fields: {"name": "Name", "phone": "Phone"},
                                filename: `contacts-${getSession()}`
                            });
                            setSelected(3);
                        }}>
                            <div className={"wrapper-li"}>
                                <div className={"wrapper-ic"}>
                                    <Sheet/>
                                </div>
                                <div className={"wrapper-text"}>
                                    <h2>
                                        Export Contact List
                                    </h2>
                                    <p>
                                        Export your contact list to excel.
                                    </p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </LeftContainer>

                <RightContainer>
                    <HeaderComponent>
                        <h2>
                            Contacts
                        </h2>

                        <div>
                            <input placeholder={"Procurar contato..."} onChange={(e) => searchContact(e)}/>
                        </div>
                    </HeaderComponent>

                    <TableContainer>
                        <DataGrid
                            color="primary"
                            variant="outlined"
                            shape="rounded"
                            pageSize={15}
                            columns={columns}
                            rows={rows}
                        />
                    </TableContainer>
                </RightContainer>
            </Container>
        </Layout>
    );
};

export default ContactsPage;
