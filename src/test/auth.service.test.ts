import { describe, expect, vi, test } from "vitest";
import { AuthService } from "../services/auth.service.js";
import type { IAuthRepository } from "../repositories/auth.repository.js";
import type { CreateUserDtoType } from "../dtos/user.dto.js";


import { checkPassword, toHashPassword } from "../lib/hash.js";

vi.mock("../lib/hash.js", async (importOrginal) => {
    const actual = await importOrginal();
    return {
        ...actual,
        toHashPassword: vi.fn(),
        checkPassword: vi.fn()
    }
});

describe("[class AuthService] ", () => {

    test("[method registerUser] should throw if the user already exists", async () => {
        const user = { name: "mock", email: "mock@gmail.com", password: "123", role: "tenant" };
        const findByEmailMock = vi.fn().mockResolvedValue(user);

        const repo: Partial<IAuthRepository> = {
            findByEmail: findByEmailMock,
        };

        const service = new AuthService(repo as IAuthRepository);
        await expect(service.registerUser(user as CreateUserDtoType)).rejects.toThrow("User already registered");
        expect(findByEmailMock).toHaveBeenCalledOnce();
        expect(findByEmailMock).toHaveBeenCalledWith(user.email);


    });
    test("[method registerUser] should throw if saving the user fails", async () => {

        const user: CreateUserDtoType = { name: "mock", email: "mock@gmail.com", password: "123", role: "tenant" };
        const findByEmailMock = vi.fn().mockResolvedValue(null);
        const saveMock = vi.fn().mockRejectedValue(new Error("some error"));
        const repo: Partial<IAuthRepository> = {
            save: saveMock,
            findByEmail: findByEmailMock,
        };
        const service = new AuthService(repo as IAuthRepository);
        await expect(service.registerUser(user)).rejects.toThrow("Error Register user");
        expect(repo.save).toHaveBeenCalledOnce();


    })
    test("[method registerUser] should register a new user", async () => {

        const user: CreateUserDtoType = { name: "mock", email: "mock@gmail.com", password: "123", role: "tenant" };
        const findByEmailMock = vi.fn().mockResolvedValue(null);
        const saveMock = vi.fn().mockResolvedValue({ ...user, _id: "1" });
        const repo: Partial<IAuthRepository> = {
            findByEmail: findByEmailMock,
            save: saveMock,
        };
        const service = new AuthService(repo as IAuthRepository);
        await expect(service.registerUser(user as CreateUserDtoType)).resolves.toMatchObject({ ...user, _id: "1" });
        expect(findByEmailMock).toHaveBeenCalledWith(user.email);
        expect(saveMock).toHaveBeenCalledOnce();

    });
    test("[method registerUser] should hash the password before saving", async () => {
        const user: CreateUserDtoType = {
            name: "mock",
            email: "mock@gmail.com",
            password: "123",
            role: "tenant",
        };
        vi.mocked(toHashPassword).mockResolvedValue("hash1");
        const findByEmailMock = vi.fn().mockResolvedValue(null);
        const saveMock = vi.fn().mockResolvedValue({
            ...user,
            _id: "1",
        });

        const repo: Partial<IAuthRepository> = {
            findByEmail: findByEmailMock,
            save: saveMock,
        };

        const service = new AuthService(repo as IAuthRepository);

        await service.registerUser(user);

        expect(saveMock).toHaveBeenCalledOnce();

        //{name,email,passwoprd}
        const savedUser = saveMock.mock.calls[0] ? saveMock.mock.calls[0][0] : {}

        expect(savedUser.password).not.toBe(user.password);
        expect(savedUser.password).toBe("hash1");
    });
    test("[method loginUser] should throw if user not exists", async () => {

        const user = { email: "mock@gnaail.com", password: "123456" }
        const findByEmailMock = vi.fn().mockResolvedValue(null);
        const repo: Partial<IAuthRepository> = {
            findByEmail: findByEmailMock

        };
        const service = new AuthService(repo as IAuthRepository);
        await expect(service.loginUser(user)).rejects.toThrow("User not found");
        expect(repo.findByEmail).toHaveBeenCalledOnce();
        expect(repo.findByEmail).toHaveBeenCalledWith(user.email)
    });
    test("[method loginUser] should throw if password is wrong", async () => {
        const user = { email: "mock@gmail.com", name: "mock", role: "tenant", _id: "1", password: "mock123" }
        vi.mocked(checkPassword).mockResolvedValue(false);

        const findByEmailMock = vi.fn().mockResolvedValue(user);
        const repo: Partial<IAuthRepository> = {
            findByEmail: findByEmailMock,
        }
        const service = new AuthService(repo as IAuthRepository);
        await expect(service.loginUser({ email: user.email, password: user.password })).rejects.toThrow("Unauthorized");
        expect(repo.findByEmail).toHaveBeenCalledOnce();
        expect(vi.mocked(checkPassword)).toHaveBeenCalledOnce();


    })
    test("[method loginUser] should throw If saving the session fails", async () => {
        const user = { email: "mock@gmail.com", name: "mock", role: "tenant", _id: "665ebef4d3c90a1b2c3d4e5f", password: "mock123" }
        vi.mocked(checkPassword).mockResolvedValue(true);
        const findByEmailMock = vi.fn().mockResolvedValue(user);
        const repo: Partial<IAuthRepository> = {
            findByEmail: findByEmailMock,
        };
        const service = new AuthService(repo as IAuthRepository);
        vi.spyOn(service, "saveSession").mockRejectedValue(new Error("error save session"));
        await expect(service.loginUser(user)).rejects.toThrow("Failed to save session");


    })

    test("[method loginUser] should throw If saving the If session generation fails", async () => {
        const user = { email: "mock@gmail.com", name: "mock", role: "tenant", _id: "1", password: "mock123" }
        vi.mocked(checkPassword).mockResolvedValue(true);
        const findByEmailMock = vi.fn().mockResolvedValue(user);
        const repo: Partial<IAuthRepository> = {
            findByEmail: findByEmailMock,
        };
        const service = new AuthService(repo as IAuthRepository);

        await expect(service.loginUser(user)).rejects.toThrow("Error generating session with ID");


    });
    test("[method loginUser] should throw If return user,refreshToken & accessToken", async () => {
        const user = { email: "mock@gmail.com", name: "mock", role: "tenant", _id: "665ebef4d3c90a1b2c3d4e5f" }
        vi.mocked(checkPassword).mockResolvedValue(true);
        const findByEmailMock = vi.fn().mockResolvedValue(user);
        const repo: Partial<IAuthRepository> = {
            findByEmail: findByEmailMock,
        };
        const service = new AuthService(repo as IAuthRepository);
        // @ts-expect-error saveSession return a Doc db or throw error
        vi.spyOn(service, "saveSession").mockResolvedValue(null);
        const expected = await service.loginUser({ ...user, password: "123456" });
        expect(expected).toHaveProperty('user');
        expect(expected).toHaveProperty('refreshToken');
        expect(expected).toHaveProperty('accessToken');



    });
  


})
